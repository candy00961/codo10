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
  contentModelMap: {
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
        },
        {
          type: 'string',
          name: 'slug',
          label: 'Slug'
        }
      ]
    }
  },
  modelExtensions: [
    { name: 'Page', type: 'page', urlPath: '/{slug}' },
    { name: 'Post', type: 'page', urlPath: '/Invoice/{slug}' }
  ],
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
    const pageModels = models.filter((m) => m.type === "page");

    return documents
      // 2. Filter all documents which are of a page model
      .filter((d) => pageModels.some(m => m.name === d.modelName))
      // 3. Map each document to a SiteMapEntry
      .map((document) => {
        // Find the model extension corresponding to the document's model
        const modelExtension = pageModels.find(m => m.name === document.modelName);

        // If model extension is found, construct the URL path
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
  },
  netlify: {
    cms: true,
    plugins: [
      {
        name: 'netlify-cms',
        options: {
          siteUrl: 'https://codo10.netlify.app',
          netlifyIdentity: true,
          manualInit: true,
        },
      },
    ],
  },
};

export default config;
