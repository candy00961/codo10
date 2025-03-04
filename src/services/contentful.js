import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
});

export default client;

export async function fetchEntries() {
  const entries = await client.getEntries();
  return entries.items;
}
