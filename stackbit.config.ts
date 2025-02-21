import { ContentfulContentSource } from '@stackbit/cms-contentful';
import { defineStackbitConfig } from '@stackbit/types';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'nextjs',
  nodeVersion: '20.18.1',
  devCommand: 'npm run dev',
  contentSources: [
    new ContentfulContentSource({
      spaceId: process.env.CONTENTFUL_SPACE_ID || 'ckfxurkvy1l5',
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
    console.log('Models loaded:', models.map(m => m.name));
    console.log('Documents loaded:', documents.map(d => ({ id: d.id, modelName: d.modelName, slug: d.fields.slug?.['en-US'] })));
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
