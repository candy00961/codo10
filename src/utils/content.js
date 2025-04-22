// src/utils/content.js
import { createClient } from 'contentful';

// --- Contentful Client Setup ---
const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_PREVIEW_TOKEN || process.env.CONTENTFUL_DELIVERY_TOKEN;
const host = process.env.CONTENTFUL_PREVIEW_TOKEN ? 'preview.contentful.com' : undefined;

if (!space) {
  // *** FIX: Throw error instead of console.error/warn for missing critical env vars ***
  throw new Error('Contentful Space ID must be provided via CONTENTFUL_SPACE_ID environment variable.');
}
if (!accessToken) {
    // *** FIX: Throw error instead of console.error/warn for missing critical env vars ***
    throw new Error('Contentful Delivery or Preview Token must be provided via environment variables.');
}

const client = createClient({
  space: space,
  accessToken: accessToken,
  host: host,
});

// --- Content Type IDs ---
const CONTENTFUL_INVOICE_TYPE_ID = 'invoice'; // Make sure this matches your actual Contentful ID
const CONTENTFUL_PAGE_TYPE_ID = 'page';       // Make sure this matches your actual Contentful ID

/**
 * Fetches a single Contentful entry based on its slug.
 */
export async function getPageFromSlug(slug, contentType) {
    if (slug === undefined || slug === null) {
        // *** FIX: Removed console.warn ***
        return null;
    }

    let typeToQuery = contentType;
    let slugForQuery = slug;

    // 1. Determine Content Type if not explicitly provided
    if (!typeToQuery) {
        if (slug.startsWith('/invoices/')) {
            typeToQuery = CONTENTFUL_INVOICE_TYPE_ID;
            slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, '');
            if (!slugForQuery) {
                // *** FIX: Removed console.warn ***
                return null;
            }
        } else {
            typeToQuery = CONTENTFUL_PAGE_TYPE_ID;
            slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, '');
        }
    } else {
         // Adjust slug based on explicitly provided type
         if (typeToQuery === CONTENTFUL_INVOICE_TYPE_ID && slug.startsWith('/invoices/')) {
            slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, '');
         } else if (typeToQuery === CONTENTFUL_PAGE_TYPE_ID) {
             slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, '');
         }
    }

    if (!typeToQuery) {
        // *** FIX: Removed console.error ***
         if (process.env.NODE_ENV === 'development') {
            console.error(`[content.js] Could not determine content type for input slug: ${slug}`);
         }
        return null;
    }

    try {
        const queryOptions = {
            content_type: typeToQuery,
            'fields.slug': slugForQuery,
            limit: 1,
            include: 2,
        };

        // *** FIX: Removed console.log for query options ***

        const entries = await client.getEntries(queryOptions);

        // *** FIX: Removed the strange inner try/catch block related to 'auth' ***

        if (entries.items && entries.items.length > 0) {
            // *** FIX: Removed console.log for found entry ***
            return entries.items[0];
        } else {
            // *** FIX: Removed console.warn for not found entry ***
            return null;
        }
    } catch (error) {
        // *** FIX: Removed console logs within the catch block, keeping error logging for debugging ***
        if (process.env.NODE_ENV === 'development') {
             console.error(`[content.js] Error fetching entry from Contentful for slug '${slug}' (type: ${typeToQuery}):`, error.message);
             if (error.response?.data) {
                 console.error('[content.js] Contentful Error Details:', JSON.stringify(error.response.data, null, 2));
                  if (error.response.data.message?.includes('unknown field')) {
                      console.error(`[content.js] HINT: Check if 'slug' field exists on Content Type '${typeToQuery}'.`);
                 }
                 if (error.response.data.message?.includes('unknownContentType')) {
                     console.error(`[content.js] HINT: The resolved content type ID '${typeToQuery}' might be incorrect or not exist in Contentful space '${space}'.`);
                 }
             }
        }
        return null; // Return null on error to allow notFound() in page component
    }
}
