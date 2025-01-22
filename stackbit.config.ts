import { defineStackbitConfig } from '@stackbit/types';

export default defineStackbitConfig({
  stackbitVersion: '~2.0.0',
  contentSources: [
    {
      name: 'contentful',
      type: 'contentful',
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      environment: 'master',
      accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
      previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN
    }
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
        }
      ]
    }
  }
});
