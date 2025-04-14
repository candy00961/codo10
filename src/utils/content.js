import { createClient } from 'contentful';

const PAGE_CONTENT_TYPES = ['page'];
const IS_DEV = process.env.NODE_ENV === 'development';
const DEBUG = process.env.DEBUG === 'true';

const client = createClient({
  accessToken: IS_DEV
    ? process.env.CONTENTFUL_PREVIEW_TOKEN || process.env.CONTENTFUL_DELIVERY_TOKEN
    : process.env.CONTENTFUL_DELIVERY_TOKEN,
  space: process.env.CONTENTFUL_SPACE_ID || 'ckfxurkvy1l5',
  host: IS_DEV ? 'preview.contentful.com' : 'cdn.contentful.com',
});

// Fetch all entries from Contentful
async function getAllEntries() {
  if (!client) throw new Error('Contentful client not initialized - missing access token');
  const entries = await client.getEntries({
    include: 10,
  });
  if (DEBUG) {
    console.log('All entries fetched:', entries.items.length);
  }
  return entries;
}

// Filter entries by content types and optional query parameters
async function getEntries(contentTypes, queryParams = {}) {
  const entries = await getAllEntries();
  const filteredItems = entries.items.filter(item => {
    const matchesType = contentTypes.includes(item.sys.contentType?.sys.id);
    const matchesSlug = queryParams['fields.slug']
      ? item.fields.slug?.['en-US'] === queryParams['fields.slug']
      : true;
    return matchesType && matchesSlug;
  });
  if (DEBUG) {
    console.log(`Filtered entries for "${contentTypes.join(',')}" with params ${JSON.stringify(queryParams)}: ${filteredItems.length}`);
  }
  return { items: filteredItems };
}

// Generate static paths from Contentful entries
export async function getPagePaths() {
  const { items } = await getEntries(PAGE_CONTENT_TYPES);
  const paths = items
    .filter(page => {
      const hasSlugField = 'slug' in page.fields;
      if (!hasSlugField && DEBUG) {
        console.warn(`Skipping entry without slug field: ${page.sys.id} (${page.sys.contentType?.sys.id})`);
      }
      return hasSlugField;
    })
    .map(page => {
      const slug = page.fields.slug?.['en-US'];
      if (!slug || typeof slug !== 'string') {
        if (DEBUG) {
          console.warn(`Skipping entry with invalid slug: ${page.sys.id} (${page.sys.contentType?.sys.id})`);
        }
        return null;
      }
      return slug.startsWith('/') ? slug : `/${slug}`;
    })
    .filter(Boolean);
  if (DEBUG) {
    console.log('Generated paths:', paths);
  }
  return paths;
}

// Fetch a single page by slug
export async function getPageFromSlug(slug) {
  const effectiveSlug = slug || '/';
  if (DEBUG) {
    console.log('Fetching page for slug:', effectiveSlug);
  }

  const { items } = await getEntries(PAGE_CONTENT_TYPES, { 'fields.slug': effectiveSlug });
  let page = items[0];

  if (!page && effectiveSlug !== '/' && effectiveSlug.startsWith('/')) {
    if (DEBUG) {
      console.log('Page not found with leading slash. Trying:', effectiveSlug.slice(1));
    }
    const { items: fallbackItems } = await getEntries(PAGE_CONTENT_TYPES, {
      'fields.slug': effectiveSlug.slice(1),
    });
    page = fallbackItems[0];
  }

  if (!page) {
    throw new Error(`Page not found for slug: ${effectiveSlug}`);
  }

  if (DEBUG) {
    console.log('Page fetched:', { id: page.sys.id, type: page.sys.contentType.sys.id, slug: page.fields.slug['en-US'] });
  }
  return mapEntry(page);
}

// Map Contentful entry to a simplified object
function mapEntry(entry) {
  const id = entry.sys?.id;
  const type = entry.sys?.contentType?.sys?.id || entry.sys?.type;

  if (entry.sys?.type === 'Asset') {
    return {
      id,
      type,
      src: `https:${entry.fields.file['en-US'].url}`,
      alt: entry.fields.title?.['en-US'] || '',
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

// Parse field values (handles nested entries and arrays)
function parseField(value) {
  if (!value) return null;
  if (typeof value === 'object' && value.sys) return mapEntry(value);
  if (Array.isArray(value)) return value.map(mapEntry);
  return value;
}
