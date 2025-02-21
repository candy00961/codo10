import { createClient } from 'contentful';

const PAGE_CONTENT_TYPES = ['homePage', 'page', 'invoice'];
const IS_DEV = process.env.NODE_ENV === 'development';

const client = createClient({
  accessToken: IS_DEV
    ? process.env.CONTENTFUL_PREVIEW_TOKEN || process.env.CONTENTFUL_DELIVERY_TOKEN
    : process.env.CONTENTFUL_DELIVERY_TOKEN,
  space: process.env.CONTENTFUL_SPACE_ID,
  host: IS_DEV ? 'preview.contentful.com' : 'cdn.contentful.com',
});

async function getEntries(contentTypes, queryParams = {}) {
  const types = Array.isArray(contentTypes) ? contentTypes.join(',') : contentTypes;
  const query = {
    'sys.contentType.sys.id[in]': types,
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
    throw error;
  }
}

export async function getPagePaths() {
  try {
    const { items } = await getEntries(PAGE_CONTENT_TYPES);
    return items
      .filter((page) => {
        const hasSlugField = 'slug' in page.fields;
        if (!hasSlugField) {
          console.warn(`Skipping entry without slug field: ${page.sys.id} (${page.sys.contentType.sys.id})`);
          return false;
        }
        return true;
      })
      .map((page) => {
        const slug = page.fields.slug?.['en-US'];
        if (!slug || typeof slug !== 'string') {
          console.warn(`Skipping entry with invalid slug: ${page.sys.id} (${page.sys.contentType.sys.id})`);
          return null;
        }
        return slug.startsWith('/') ? slug : `/${slug}`;
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching page paths:', error.message);
    return [];
  }
}

export async function getPageFromSlug(slug) {
  const effectiveSlug = slug || '/';
  console.log('Fetching page for slug:', effectiveSlug);

  try {
    const { items } = await getEntries(PAGE_CONTENT_TYPES, { 'fields.slug': effectiveSlug });
    let page = items[0];

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

function parseField(value) {
  if (!value) return null;
  if (typeof value === 'object' && value.sys) return mapEntry(value);
  if (Array.isArray(value)) return value.map(mapEntry);
  return value;
}
