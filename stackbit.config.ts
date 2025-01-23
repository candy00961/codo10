import { ContentfulContentSource } from '@stackbit/cms-contentful';
import { defineStackbitConfig, SiteMapEntry } from "@stackbit/types";

const config = {
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
    { name: '1234', type: 'Invoice', urlPath: '/{slug}' },
    { name: 'Home', type: 'Home', urlPath: '/' }
  ],
  import: {
    type: 'contentful',
    contentFile: 'contentful/export.json',
    uploadAssets: true,
    assetsDirectory: 'contentful',
    spaceIdEnvVar: 'CONTENTFUL_SPACE_ID',
    deliveryTokenEnvVar: 'CONTENTFUL_DELIVERY_TOKEN',
    previewTokenEnvVar: 'CONTENTFUL_PREVIEW_TOKEN',
    accessTokenEnvVar: 'CONTENTFUL_MANAGEMENT_TOKEN',
  },
  siteMap: ({ documents, models }) => {
    const pageModels = models.filter((m) => m.type === "page");

    return documents
      .filter((d) => pageModels.some(m => m.name === d.modelName))
      .map((document) => {
        const modelExtension = pageModels.find(m => m.name === document.modelName);

        if (modelExtension) {
          const urlPath = modelExtension.urlPath.replace("{slug}", document.slug);
          return {
            stableId: document.id,
            urlPath: urlPath,
            document,
            isHomePage: false,
          };
        }
        return null;
      })
      .filter(Boolean) as SiteMapEntry[];
  }
};

export default config;
