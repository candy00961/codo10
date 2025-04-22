// src/utils/content.js
import { createClient } from 'contentful';

// --- Contentful Client Setup ---
const space = process.env.CONTENTFUL_SPACE_ID;
// Use preview token if available, otherwise delivery token
const accessToken = process.env.CONTENTFUL_PREVIEW_TOKEN || process.env.CONTENTFUL_DELIVERY_TOKEN;
const host = process.env.CONTENTFUL_PREVIEW_TOKEN
  ? 'preview.contentful.com'
  : undefined; // Use default host (cdn.contentful.com) for delivery API

if (!space) {
  throw new Error('Contentful Space ID must be provided via CONTENTFUL_SPACE_ID environment variable.');
}
if (!accessToken) {
    throw new Error('Contentful Delivery API Token (CONTENTFUL_DELIVERY_TOKEN) or Preview API Token (CONTENTFUL_PREVIEW_TOKEN) must be provided via environment variables.');
}

const client = createClient({
  space: space,
  accessToken: accessToken,
  host: host,
});

// --- Content Type IDs ---
const CONTENTFUL_INVOICE_TYPE_ID = 'invoice'; // Use your actual invoice content type ID
const CONTENTFUL_PAGE_TYPE_ID = 'page'; // Used for default pages

/**
 * Fetches a single Contentful entry based on its slug.
 * Determines content type based on slug pattern (/invoices/ vs default 'page'),
 * unless a specific contentType is provided.
 *
 * @param {string} slug - The URL slug (e.g., "/", "/about", "/invoices/inv-001").
 * @param {string} [contentType] - Optional: Explicitly specify Contentful ID (overrides pattern matching).
 * @returns {Promise<object|null>} - The Contentful entry object or null.
 */
export async function getPageFromSlug(slug, contentType) {
    if (slug === undefined || slug === null) {
        // console.warn('[content.js] getPageFromSlug called with invalid slug.'); // Removed console
        return null;
    }

    let typeToQuery = contentType;
    let slugForQuery = slug;

    // 1. Determine Content Type if not explicitly provided
    if (!typeToQuery) {
        if (slug.startsWith('/invoices/')) {
            typeToQuery = CONTENTFUL_INVOICE_TYPE_ID;
            // Remove the prefix for the query, handle potential trailing slash
            slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, '');
            if (!slugForQuery) {
                // console.warn(`[content.js] Invalid invoice slug detected: ${slug}`); // Removed console
                return null;
            }
        } else {
            // Default to 'page' type for everything else, including homepage slug '/'
            typeToQuery = CONTENTFUL_PAGE_TYPE_ID;
            // Adjust slug format for query - Contentful usually stores '/' for homepage
            // Other pages usually don't have leading/trailing slashes in their slug field
            slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, '');
        }
    } else {
         // Content Type was provided explicitly, adjust slug if needed based on convention
         if (typeToQuery === CONTENTFUL_INVOICE_TYPE_ID && slug.startsWith('/invoices/')) {
            slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, '');
         } else if (typeToQuery === CONTENTFUL_PAGE_TYPE_ID) {
             slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, '');
         }
         // Add adjustments for other explicit types if needed
    }

    if (!typeToQuery) {
        console.error(`[content.js] Could not determine content type for input slug: ${slug}`); // Keep error log
        return null;
    }

    // console.log(`[content.js] Querying Contentful: type='${typeToQuery}', querySlug='${slugForQuery}'`); // Removed console

    try {
        // Build the query object - assumes BOTH 'page' and 'invoice' types have a 'slug' field
        const queryOptions = {
            content_type: typeToQuery,
            'fields.slug': slugForQuery, // Filter by the processed slug
            limit: 1,
            include: 2, // Include linked sections/references up to 2 levels deep
        };

        const entries = await client.getEntries(queryOptions);

        if (entries.items && entries.items.length > 0) {
            // console.log(`[content.js] Found entry for type='${typeToQuery}', input slug='${slug}'`); // Removed console
            return entries.items[0];
        } else {
            // console.warn(`[content.js] No entry found for type='${typeToQuery}', input slug='${slug}' (query options: ${JSON.stringify(queryOptions)})`); // Removed console
            return null;
        }
    } catch (error) {
        console.error(`[content.js] Error fetching entry from Contentful for input slug '${slug}':`, error.message); // Keep error log
        if (error.response?.data) {
            console.error('[content.js] Contentful Error Details:', JSON.stringify(error.response.data, null, 2)); // Keep error log
             if (error.response.data.message?.includes('unknown field') || error.response.data.message?.includes('No field with id')) {
                 console.error(`[content.js] HINT: Check if the field 'slug' exists on the Content Type '${typeToQuery}' in Contentful.`); // Keep error log
            }
            if (error.response.data.message?.includes('unknownContentType')) {
                console.error(`[content.js] HINT: The resolved content type ID '${typeToQuery}' might be incorrect or does not exist in Contentful space '${space}'. Check CONTENTFUL_*_TYPE_ID variables/defaults.`); // Keep error log
            }
        } else {
            // console.error('[content.js] Full Error Object:', error); // Removed console
        }
        return null;
    }
}
