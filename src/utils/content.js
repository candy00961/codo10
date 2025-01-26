import { createClient } from 'contentful';
const PAGE_CONTENT_TYPE_ID = 'homePage'; // Updated to match the content type ID in Contentful
const IS_DEV = process.env.NODE_ENV === 'development';

async function getEntries(content_type, queryParams = {}) {
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
