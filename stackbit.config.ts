import { ContentfulContentSource } from '@stackbit/cms-contentful';
import { defineStackbitConfig } from '@stackbit/types';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'next',
  nodeVersion: '20.18.1',
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
    { name: 'invoice', type: 'page', urlPath: '/invoice/{slug}' },
  ],
  siteMap: ({ documents, models }) => {
    const pageModels = models.filter((m) => m.type === 'page');

    return documents
      .filter((d) => pageModels.some((m) => m.name === d.modelName))
      .map((document) => {
        const modelExtension = pageModels.find((m) => m.name === document.modelName);
        if (modelExtension) {
          const urlPath = modelExtension.urlPath.replace('{slug}', document.fields.slug['en-US'] || '');
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
