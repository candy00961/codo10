import { ContentfulContentSource } from '@stackbit/cms-contentful';
import { defineStackbitConfig } from '@stackbit/types';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_CONTENTFUL_SPACE_ID',
  'NEXT_PUBLIC_CONTENTFUL_PREVIEW_TOKEN',
  'CONTENTFUL_MANAGEMENT_TOKEN',
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is not set`);
    process.exit(1);
  }
});

export default defineStackbitConfig({
  stackbitVersion: '~2.1.0', // Compatible with latest features
  ssgName: 'nextjs',
  nodeVersion: '20.18.1', // Match your Node.js version
  devCommand: 'npm run dev',
  contentSources: [
    new ContentfulContentSource({
      spaceId: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
      environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
      previewToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_TOKEN,
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    }),
  ],
  modelExtensions: [
    { name: 'homepage', type: 'page', urlPath: '/{slug}' }, // Ensure 'page' matches Contentful content type ID
  ],
  siteMap: ({ documents, models }) => {
    const pageModels = models.filter((m) => m.type === 'page');
    return documents
      .filter((d) => pageModels.some((m) => m.name === d.modelName))
      .map((document) => {
        const modelExtension = pageModels.find((m) => m.name === document.modelName);
        if (modelExtension) {
          const urlPath = modelExtension.urlPath.replace('{slug}', document.fields.slug?.['en-US'] || '');
          return {
            stableId: document.id,
            urlPath,
            document,
            isHomePage: document.modelName === 'page' && urlPath === '/',
          };
        }
        return null;
      })
      .filter(Boolean);
  },
});
