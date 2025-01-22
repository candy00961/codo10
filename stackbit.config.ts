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
  ], contentModelMap: {
    invoice: { type: 'data' }
  },
  
   models: {
    invoice: {
      type: 'data',
      label: 'Invoice',
      description: 'invoice',
      labelField: 'invoiceNumber',
      fields: [
        {
          type: 'string',
          name: 'invoiceNumber',
          label: 'Invoice number'
        },
        {
          type: 'text',
          name: 'customerName',
          label: 'Customer name'
        },
        {
          type: 'number',
          name: 'totalAmount',
          label: 'Total amount'
        },
        {
          type: 'date',
          name: 'dueDate',
          label: 'Due date'
        },
        {
          type: 'object',
          name: 'items',
          label: 'Items'
        },
        {
          type: 'boolean',
          name: 'paymentReceived',
          label: 'Payment received'
        }
      ]
    }
  }
  modelExtensions: [{ name: 'page', type: 'page', urlPath: '/{slug}' }],
  // Needed only for importing this repository via https://app.stackbit.com/import?mode=duplicate
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
    // 1. Filter all page models which were defined in modelExtensions
    const pageModels = models.filter((m) => m.type === "page")

    return documents
      // 2. Filter all documents which are of a page model
      .filter((d) => pageModels.some(m => m.name === d.modelName))
      // 3. Map each document to a SiteMapEntry
      .map((document) => {
        // Map the model name to its corresponding URL
        const urlModel = (() => {
            switch (document.modelName) {
                case 'Page':
                    return 'otherPage';
                case 'Blog':
                    return 'otherBlog';
                default:
                    return null;
            }
        })();

        return {
          stableId: document.id,
          urlPath: `/${urlModel}/${document.id}`,
          document,
          isHomePage: false,
        };
      })
      .filter(Boolean) as SiteMapEntry[];
  }
};

export default config;
