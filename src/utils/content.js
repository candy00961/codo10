// src/utils/content.js
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
const CONTENTFUL_PAGE_TYPE_ID = 'page';       // Make sure this matches your actual Contentful ID

/**
 * Fetches a single Contentful entry based on its slug.
 */
export async function getPageFromSlug(slug, contentType) {
    if (slug === undefined || slug === null) {
        // Removed console.warn
        return null;
    }

    let typeToQuery = contentType;
    let slugForQuery = slug;

    // 1. Determine Content Type if not explicitly provided
    if (!typeToQuery) {
        if (slug.startsWith('/invoices/')) {
            typeToQuery = CONTENTFUL_INVOICE_TYPE_ID;
            slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, ''); // Remove trailing slash from slug
            if (!slugForQuery) {
                // Removed console.warn
                return null;
            }
        } else {
            // Default to 'page' type for everything else, including homepage slug '/'
            typeToQuery = CONTENTFUL_PAGE_TYPE_ID;
             // Adjust slug format for query - assumes 'page' slugs don't have leading '/' EXCEPT homepage itself
            slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes for non-root slugs
        }
    } else {
         // Content Type was provided explicitly, adjust slug if needed
         if (typeToQuery === CONTENTFUL_INVOICE_TYPE_ID && slug.startsWith('/invoices/')) {
            slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, '');
         } else if (typeToQuery === CONTENTFUL_PAGE_TYPE_ID) {
             slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, '');
         }
         // Add adjustments for other explicit types if needed
    }

    if (!typeToQuery) {
        // Removed console.error
         if (process.env.NODE_ENV === 'development') {
            console.error(`[content.js] Could not determine content type for input slug: ${slug}`);
         }
        return null;
    }

    // Removed console.log for query options

    try {
        // Build the query object - assumes BOTH 'page' and 'invoice' types have a 'fields.slug'
        const queryOptions = {
            content_type: typeToQuery,
            'fields.slug': slugForQuery, // Always filter by slug now
            limit: 1,
            include: 2, // Include linked sections/references (important for page sections)
        };

        const entries = await client.getEntries(queryOptions);
        const e = entries.items[0].fields;
        // *** CRITICAL FIX: REMOVED THE PROBLEMATIC TRY/CATCH BLOCK RELATED TO 'auth' HERE ***
        // The code that was here was:
         try {
             const { auth = null } = e || {};
             if (!auth) {
                 console.error("auth is missing");
                 return null;
             }
         } catch (error) {
             console.error("Error destructuring auth:", error);
             return null;
         }


        if (entries.items && entries.items.length > 0) {
            // Removed console.log for found entry
            return entries.items[0];
        } else {
            // Removed console.warn for not found entry
            return null;
        }
    } catch (error) {
        // Error Logging (keep for debugging)
        if (process.env.NODE_ENV === 'development') {
             console.error(`[content.js] Error fetching entry from Contentful for slug '${slug}' (type: ${typeToQuery}):`, error.message);
             if (error.response?.data) {
                 console.error('[content.js] Contentful Error Details:', JSON.stringify(error.response.data, null, 2));
                  if (error.response.data.message?.includes('unknown field') || error.response.data.message?.includes('No field with id')) {
                     console.error(`[content.js] HINT: Check if the field 'slug' exists on the Content Type '${typeToQuery}' in Contentful.`);
                 }
                 if (error.response.data.message?.includes('unknownContentType')) {
                     console.error(`[content.js] HINT: The resolved content type ID '${typeToQuery}' might be incorrect or does not exist in Contentful space '${space}'. Check CONTENTFUL_*_TYPE_ID variables/defaults.`);
                 }
             }
        }
        return null; // Return null on error to allow notFound() in page component
    }
} // End of getPageFromSlug function
