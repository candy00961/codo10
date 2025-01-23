import { defineStackbitConfig } from "@stackbit/types";
import { createClient } from "contentful";

// Create Contentful client outside of the configuration
const client = createClient({
spaceId: process.env.CONTENTFUL_SPACE_ID,
      environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
      previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN ,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN ,

});

export default defineStackbitConfig({
  stackbitVersion: "~0.6.0",
  nodeVersion: "20.18.1",
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
        }
      ]
    }
  },
modelExtensions: [
    { name: 'Page', type: 'page', urlPath: '/{slug}' },
    { name: 'Post', type: 'page', urlPath: '/Home/{slug}' }
  ],
  
  siteMap: ({ documents }) => {
    if (!documents || !Array.isArray(documents)) {
      console.warn("Documents are undefined or not an array.");
      return [];
    }

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
  }
};

// Separate the fetchEntries function
export async function fetchEntries(contentType: string) {
  try {
    const entries = await client.getEntries({
      content_type: contentType,
      "fields.slug[exists]": true,
    });
    return entries.items;
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
}
