// src/utils/content.js
// console.log("***** CONTENT.JS - VERSION CHECK - MAY 06 - 01 *****"); // Optional: Update version marker

import { createClient } from 'contentful';
import { draftMode } from 'next/headers'; // Import draftMode

// --- Contentful Client Setup ---
const space = process.env.CONTENTFUL_SPACE_ID;

// --- Determine Access Token and Host based on draftMode ---
// NOTE: This section needs to run where `draftMode()` is available,
// so we might need to pass the preview state down or create the client inside getPageFromSlug.
// Let's create the client inside the function for simplicity here.

// --- Content Type IDs ---
const CONTENTFUL_INVOICE_TYPE_ID = 'invoice';
const CONTENTFUL_PAGE_TYPE_ID = 'page';

/**
 * Fetches a single Contentful entry based on its slug.
 */
export async function getPageFromSlug(slug, contentType) {
    // console.log(`getPageFromSlug called with slug: ${slug}, contentType: ${contentType}`);

    // Determine if draft mode is enabled WITHIN the function/request context
    let isPreview = false;
    try {
      isPreview = draftMode().isEnabled;
    } catch (e) {
      // draftMode() throws error if called outside request scope (e.g. during build)
      // We can rely on environment variables during build/prerender
      isPreview = !!process.env.CONTENTFUL_PREVIEW_TOKEN;
    }

    const accessToken = isPreview
      ? process.env.CONTENTFUL_PREVIEW_TOKEN
      : process.env.CONTENTFUL_DELIVERY_TOKEN;

    const host = isPreview ? 'preview.contentful.com' : undefined; // Use default host for delivery API

    if (!space) {
      throw new Error('Contentful Space ID must be provided via CONTENTFUL_SPACE_ID environment variable.');
    }
    if (!accessToken) {
        if (isPreview) {
             throw new Error('Contentful Preview Token must be provided via CONTENTFUL_PREVIEW_TOKEN for draft/preview mode.');
        } else {
             throw new Error('Contentful Delivery Token must be provided via CONTENTFUL_DELIVERY_TOKEN for live mode.');
        }
    }

    // Create client inside the function with the correct token/host
    const client = createClient({
      space: space,
      accessToken: accessToken,
      host: host,
      environment: process.env.CONTENTFUL_ENVIRONMENT || 'master', // Add environment
    });

    if (slug === undefined || slug === null) {
        return null;
    }

    let typeToQuery = contentType;
    let slugForQuery = slug;

    // Determine Content Type ID
    if (!typeToQuery) {
        if (slug.startsWith('/invoices/')) {
            typeToQuery = CONTENTFUL_INVOICE_TYPE_ID;
        } else {
            typeToQuery = CONTENTFUL_PAGE_TYPE_ID; // Default to 'page'
        }
    }

    // Prepare slug for query
    if (typeToQuery === CONTENTFUL_INVOICE_TYPE_ID) {
        slugForQuery = slug.substring('/invoices/'.length).replace(/\/$/, '');
        if (!slugForQuery) return null;
    } else if (typeToQuery === CONTENTFUL_PAGE_TYPE_ID) {
        slugForQuery = slug === '/' ? '/' : slug.replace(/^\/|\/$/g, '');
    }
     // Add handling for other explicit types if necessary

    if (!typeToQuery) {
         if (process.env.NODE_ENV === 'development') { console.error(`[content.js] Could not determine content type for input slug: ${slug}`); }
        return null;
    }

    // console.log(`[content.js] Querying Contentful: type='${typeToQuery}', slug='${slugForQuery}', preview=${isPreview}`);

    try {
        const queryOptions = {
            content_type: typeToQuery,
            'fields.slug': slugForQuery,
            limit: 1,
            include: 2,
        };

        const entries = await client.getEntries(queryOptions);

        if (entries?.items?.length > 0) {
            return entries.items[0];
        } else {
             if (process.env.NODE_ENV === 'development') { console.warn(`[content.js] No entry found for type='${typeToQuery}', slug='${slugForQuery}' (Preview: ${isPreview})`); }
            return null;
        }
    } catch (error) {
        console.error(`[content.js] Error fetching entry from Contentful for slug '${slug}' (type: ${typeToQuery}, querySlug: ${slugForQuery}, preview: ${isPreview}):`, error.message);
        // ... (rest of error handling) ...
        return null;
    }
}
