import { createClient } from 'contentful';

const PAGE_CONTENT_TYPE_ID = 'homepage'; // Ensure this matches your Contentful content type
const IS_DEV = process.env.NODE_ENV === 'development';

async function getEntries(content_type, queryParams) {
  // Initialize Contentful client
  const client = createClient({
    accessToken: IS_DEV ? process.env.CONTENTFUL_PREVIEW_TOKEN : process.env.CONTENTFUL_DELIVERY_TOKEN,
    space: process.env.CONTENTFUL_SPACE_ID,
    host: IS_DEV ? 'preview.contentful.com' : 'cdn.contentful.com',
  });

  // Construct the query
  const query = { content_type: 'homePage',
  'fields.slug': slug, 
  include: 10,
                };
  console.log('Query:', query); // Debugging: Log the query

  try {
    // Fetch entries from Contentful
    const entries = await client.getEntries(query);
    console.log('Entries fetched successfully:', entries.items.length); // Debugging: Log the number of entries fetched
    return entries;
  } catch (error) {
    console.error('Error fetching entries:', error); // Debugging: Log the error
    throw error; // Re-throw the error to handle it in the calling function
  }
}

export async function getPagePaths() {
  try {
    const { items } = await getEntries(PAGE_CONTENT_TYPE_ID);
    return items.map((page) => {
      const slug = page.fields.slug;
      return slug.startsWith('/') ? slug : `/${slug}`;
    });
  } catch (error) {
    console.error('Error fetching page paths:', error);
    return [];
  }
}

export async function getPageFromSlug(slug) {
  try {
    console.log('Fetching page for slug:', slug); // Debugging: Log the slug
    const { items } = await getEntries(PAGE_CONTENT_TYPE_ID, { 'fields.slug': slug });
    let page = (items ?? [])[0];

    // If page is not found, try removing the leading slash
    if (!page && slug !== '/' && slug.startsWith('/')) {
      console.log('Trying slug without leading slash:', slug.slice(1)); // Debugging: Log the modified slug
      const { items } = await getEntries(PAGE_CONTENT_TYPE_ID, { 'fields.slug': slug.slice(1) });
      page = (items ?? [])[0];
    }

    if (!page) {
      throw new Error(`Page not found for slug: ${slug}`);
    }

    return mapEntry(page);
  } catch (error) {
    console.error('Error fetching page from slug:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

function mapEntry(entry) {
  const id = entry.sys?.id;
  const type = entry.sys?.contentType?.sys?.id || entry.sys?.type;

  if (entry.sys?.type === 'Asset') {
    return {
      id,
      type,
      src: `https:${entry.fields.file.url}`,
      alt: entry.fields.title,
    };
  }

  return {
    id,
    type,
    ...Object.fromEntries(Object.entries(entry.fields).map(([key, value]) => [key, parseField(value)])),
  };
}

function parseField(value) {
  if (typeof value === 'object' && value.sys) return mapEntry(value);
  if (Array.isArray(value)) return value.map(mapEntry);
  return value;
}
