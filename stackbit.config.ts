import { ContentfulContentSource } from '@stackbit/cms-contentful';
import { defineStackbitConfig } from '@stackbit/types';
import dotenv from 'dotenv';

// Load environment variables explicitly
dotenv.config({ path: './.env' });

// Validate required environment variables
const requiredEnvVars = [
  'CONTENTFUL_SPACE_ID',
  'CONTENTFUL_PREVIEW_TOKEN',
  'CONTENTFUL_MANAGEMENT_TOKEN',
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is not set`);
    process.exit(1);
  }
});

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'nextjs', // Corrected from 'next' to match Stackbit expectation
  nodeVersion: '20.18.1',
  devCommand: 'npm run dev',
  contentSources: [
    new ContentfulContentSource({
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
      previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    }),
  ],
  modelExtensions: [
    { name: 'homePage', type: 'page', urlPath: '/{slug}' },
    { name: 'page', type: 'page', urlPath: '/{slug}' },
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
