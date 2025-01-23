import { ContentfulContentSource } from '@stackbit/cms-contentful';
import { defineStackbitConfig, SiteMapEntry } from "@stackbit/types";

const config = defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'nextjs',
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
    // Use names that exist in Contentful
    { name: 'home', type: 'page', urlPath: '/{slug}' },
    { name: 'invoice', type: 'page', urlPath: '/invoices/{slug}' },
  ],
  siteMap: ({ documents, models }) => {
    const pageModels = models.filter((m) => m.type === 'page');

    return documents
      .filter((d) => pageModels.some((m) => m.name === d.modelName))
      .map((document) => {
        const modelExtension = pageModels.find((m) => m.name === document.modelName);

        if (modelExtension) {
          const urlPath = modelExtension.urlPath.replace('{slug}', document.slug);
          return {
            stableId: document.id,
            urlPath,
            document,
            isHomePage: document.modelName === 'home',
          };
        }

        return null;
      })
      .filter(Boolean) as SiteMapEntry[];
  },
});

export default config;
