// stackbit.config.ts
import { defineStackbitConfig } from "@stackbit/types";
import { ContentfulContentSource } from '@stackbit/cms-contentful';

// Keep these checks/warnings if you like, but they might also fail if process.env isn't populated
// if (!process.env.CONTENTFUL_SPACE_ID) { console.error('Stackbit Config Error: CONTENTFUL_SPACE_ID env var missing!'); }
// ... etc ...

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  nodeVersion: '20.18.1', // Or your desired Node version

  contentSources: [
    new ContentfulContentSource({
      // *** TEMPORARY HARDCODING FOR TESTING ***
      spaceId: 'ckfxurkvy1l5', // Replace with your actual space ID string literal
      // ****************************************
      environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
      previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN!,
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!, // Management token for Stackbit schema features
    }),
  ],

  // ... rest of your config ...
  modelExtensions: [
     { name: 'page', type: 'page', urlPath: '/{slug}' },
     { name: 'invoice', type: 'page', urlPath: '/invoices/{slug}' },
     { name: 'hero', type: 'data' },
     { name: 'stats', type: 'data' },
     { name: 'button', type: 'data' },
     { name: 'statItem', type: 'data' },
  ],
  // ... siteMap function ...
});
