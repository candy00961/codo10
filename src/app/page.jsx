import { notFound } from 'next/navigation';

// Assuming this is in src/app/[...slug]/page.jsx
export default async function Page({ params }) {
  const pageSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params.slug || 'home';

  // Fetch page data based on the slug
  const pageData = await fetchPageData(pageSlug);

  if (!pageData) {
    console.error('Page Slug is undefined or invalid:', pageSlug);
    return notFound();
  }

  return <Page data={pageData} />;
}

// Example fetch function (adjust based on your setup)
async function fetchPageData(pageSlug) {
  // Fetch from Contentful or your CMS using the slug
  // Use the slug variable here
  console.log('Fetching data for slug:', pageSlug);
  // Return null if no page is found
}
