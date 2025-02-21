import { createClient } from 'contentful';

// Define supported page-like content types
const PAGE_CONTENT_TYPES = ['homePage', 'page', 'invoice'];
const IS_DEV = process.env.NODE_ENV === 'development';

// Initialize Contentful client (shared instance for performance)
const client = createClient({
  accessToken: IS_DEV
    ? process.env.CONTENTFUL_PREVIEW_TOKEN || process.env.CONTENTFUL_DELIVERY_TOKEN
    : process.env.CONTENTFUL_DELIVERY_TOKEN,
  space: process.env.CONTENTFUL_SPACE_ID,
  host: IS_DEV ? 'preview.contentful.com' : 'cdn.contentful.com',
});

/**
 * Fetch entries from Contentful for given content types
 * @param {string|string[]} contentTypes - Single or array of content type IDs
 * @param {object} queryParams - Additional query parameters
 * @returns {Promise<object>} - Entries response
 */
async function getEntries(contentTypes, queryParams = {}) {
  const types = Array.isArray(contentTypes) ? contentTypes.join(',') : contentTypes;
  const query = {
    'sys.contentType.sys.id[in]': types, // Support multiple content types
    ...queryParams,
    include: 10,
  };
  console.log('Query:', JSON.stringify(query, null, 2));

  try {
    const entries = await client.getEntries(query);
    console.log(`Entries fetched successfully for content types "${types}": ${entries.items.length}`);
    return entries;
  } catch (error) {
    console.error('Error fetching entries:', error.message);
    throw error; // Propagate error for explicit handling
  }
}

/**
 * Get all page paths for static generation
 * @returns {Promise<string[]>} - Array of slug paths
 */
export async function getPagePaths() {
  try {
    const { items } = await getEntries(PAGE_CONTENT_TYPES);
    return items
      .map((page) => {
        const slug = page.fields.slug?.['en-US'];
        if (!slug || typeof slug !== 'string') {
          console.warn(`Skipping entry with invalid slug: ${page.sys.id}`);
          return null;
        }
        return slug.startsWith('/') ? slug : `/${slug}`;
      })
      .filter(Boolean); // Remove null entries
  } catch (error) {
    console.error('Error fetching page paths:', error.message);
    return [];
  }
}

/**
 * Fetch a page by slug, supporting multiple content types
 * @param {string} slug - The slug to look up
 * @returns {Promise<object>} - Mapped page data
 */
export async function getPageFromSlug(slug) {
  const effectiveSlug = slug || '/'; // Default to root if undefined
  console.log('Fetching page for slug:', effectiveSlug);

  try {
    const { items } = await getEntries(PAGE_CONTENT_TYPES, { 'fields.slug': effectiveSlug });
    let page = items[0];

    // Fallback: Try without leading slash if not found
    if (!page && effectiveSlug !== '/' && effectiveSlug.startsWith('/')) {
      console.log('Page not found with leading slash. Trying:', effectiveSlug.slice(1));
      const { items: fallbackItems } = await getEntries(PAGE_CONTENT_TYPES, {
        'fields.slug': effectiveSlug.slice(1),
      });
      page = fallbackItems[0];
    }

    if (!page) {
      const errorMessage = `Page not found for slug: ${effectiveSlug}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return mapEntry(page);
  } catch (error) {
    console.error('Error fetching page from slug:', error.message);
    throw error;
  }
}

/**
 * Map a Contentful entry to a simplified object
 * @param {object} entry - Raw Contentful entry
 * @returns {object} - Mapped entry
 */
function mapEntry(entry) {
  const id = entry.sys?.id;
  const type = entry.sys?.contentType?.sys?.id || entry.sys?.type;

  if (entry.sys?.type === 'Asset') {
    return {
      id,
      type,
      src: `https:${entry.fields.file['en-US'].url}`,
      alt: entry.fields.title['en-US'],
    };
  }

  return {
    id,
    type,
    ...Object.fromEntries(
      Object.entries(entry.fields).map(([key, value]) => [key, parseField(value['en-US'])]),
    ),
  };
}

/**
 * Parse field values, handling nested entries and arrays
 * @param {*} value - Field value from Contentful
 * @returns {*} - Parsed value
 */
function parseField(value) {
  if (!value) return null;
  if (typeof value === 'object' && value.sys) return mapEntry(value);
  if (Array.isArray(value)) return value.map(mapEntry);
  return value;
}
