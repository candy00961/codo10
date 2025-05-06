// src/utils/content.js
console.log("***** CONTENT.JS - VERSION CHECK - APRIL 26 - 02 *****"); // <-- Unique marker added

import { createClient } from 'contentful';

// --- Contentful Client Setup ---
const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_PREVIEW_TOKEN || process.env.CONTENTFUL_DELIVERY_TOKEN;
const host = process.env.CONTENTFUL_PREVIEW_TOKEN ? 'preview.contentful.com' : undefined;

if (!space) {
  // Throw error instead of console.error/warn for missing critical env vars
  throw new Error('Contentful Space ID must be provided via CONTENTFUL_SPACE_ID environment variable.');
}
if (!accessToken) {
    // Throw error instead of console.error/warn for missing critical env vars
    throw new Error('Contentful Delivery or Preview Token must be provided via environment variables.');
}

const client = createClient({
  space: space,
  accessToken: accessToken,
  host: host,
});

// --- Content Type IDs ---
const CONTENTFUL_INVOICE_TYPE_ID = 'invoice'; // Make sure this matches your actual Contentful ID
const CONTENTFUL_PAGE_TYPE_ID = 'page';       // Use this for homepage AND regular pages

/**
 * Fetches a single Contentful entry based on its slug.
 */
export async function getPageFromSlug(slug, contentType) {
    // console.log(`getPageFromSlug called with slug: ${slug}, contentType: ${contentType}`); // Optional detailed debug

    if (slug === undefined || slug === null) {
        return null;
    }

    let typeToQuery;
    let slugForQuery = slug;

    // 1. Determine Content Type ID based on slug pattern or explicit request
    if (contentType) {
        // If type is explicitly provided, use it (primarily for homepage '/' override)
        typeToQuery = contentType;
        if (typeToQuery === CONTENTFUL_PAGE_TYPE_ID) {
             slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, ''); // Clean page slugs
        } else if (typeToQuery === CONTENTFUL_INVOICE_TYPE_ID && slug.startsWith('/invoices/')) {
             slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, '');
        } else {
            // Handle potential mismatch if contentType is passed but doesn't match slug pattern
            slugForQuery = slug.replace(/^\/|\/$/g, '');
        }

    } else {
        // Auto-detect type based on slug pattern
        if (slug.startsWith('/invoices/')) {
            typeToQuery = CONTENTFUL_INVOICE_TYPE_ID;
            slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, '');
        } else {
            // Default to 'page' for '/' and other paths not matching invoice pattern
            typeToQuery = CONTENTFUL_PAGE_TYPE_ID;
            slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, ''); // Clean page slugs
        }
    }

    // Validate slugForQuery for invoice type
    if (typeToQuery === CONTENTFUL_INVOICE_TYPE_ID && !slugForQuery) {
         if (process.env.NODE_ENV === 'development') {
            console.warn(`[content.js] Invalid invoice slug detected after processing: ${slug}`);
         }
         return null;
    }


    if (!typeToQuery) {
         if (process.env.NODE_ENV === 'development') {
            console.error(`[content.js] Could not determine content type for input slug: ${slug}`);
         }
        return null;
    }

    // console.log(`[content.js] Querying Contentful: type='${typeToQuery}', slug='${slugForQuery}'`); // Optional debug

    try {
        // Build the query object - assumes BOTH 'page' and 'invoice' types have a 'fields.slug'
        const queryOptions = {
            content_type: typeToQuery,
            'fields.slug': slugForQuery, // Always filter by slug now
            limit: 1,
            include: 2, // Include linked sections/references (important for page sections)
        };

        const entries = await client.getEntries(queryOptions);

        // *** THE PROBLEMATIC TRY/CATCH BLOCK RELATED TO 'auth' HAS BEEN REMOVED ***

        // Check if items exist and return the first one, otherwise return null
        if (entries?.items?.length > 0) {
            // console.log(`[content.js] Found entry for type='${typeToQuery}', slug='${slugForQuery}'`); // Optional debug
            return entries.items[0];
        } else {
             if (process.env.NODE_ENV === 'development') {
                 console.warn(`[content.js] No entry found for type='${typeToQuery}', slug='${slugForQuery}' using query:`, queryOptions);
             }
            return null;
        }
    } catch (error) {
        // Error Logging (keep for debugging)
        console.error(`[content.js] Error fetching entry from Contentful for slug '${slug}' (type: ${typeToQuery}, querySlug: ${slugForQuery}):`, error.message);
        if (error.response?.data) {
            console.error('[content.js] Contentful Error Details:', JSON.stringify(error.response.data, null, 2));
             if (error.response.data.message?.includes('unknown field')) {
                 console.error(`[content.js] HINT: Check if the field 'slug' exists on the Content Type '${typeToQuery}' in Contentful.`);
             }
             if (error.response.data.message?.includes('unknownContentType')) {
                 console.error(`[content.js] HINT: The resolved content type ID '${typeToQuery}' might be incorrect or does not exist in Contentful space '${space}'. Check CONTENTFUL_*_TYPE_ID variables/defaults.`);
             }
        } else {
             // Log the full error if no response data is available
             console.error('[content.js] Full Error Object:', error);
        }
        return null; // Return null on error to allow notFound() in page component
    }
} // End of getPageFromSlug function
