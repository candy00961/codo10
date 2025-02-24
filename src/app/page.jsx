import { notFound } from 'next/navigation';

// Page component for catch-all routes
export default async function Page({ params }) {
  // Construct pageSlug from params.slug
  // Handle cases where params.slug is an array (catch-all route) or a string
  const pageSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params.slug || 'home';

  // Fetch page data based on the constructed pageSlug
  const pageData = await fetchPageData(pageSlug);

  // Handle cases where pageData is not found
  if (!pageData) {
    // Log the error for debugging (consider removing in production)
    console.error('Page Slug is undefined or invalid:', pageSlug);
    return notFound();
  }

  // Render the Page component with the fetched data
  return <Page data={pageData} />;
}

// Example fetch function (replace with actual implementation)
async function fetchPageData(pageSlug) {
  // Fetch data from Contentful or your CMS using pageSlug
  // This is a placeholder; implement the actual fetch logic
  console.log('Fetching data for slug:', pageSlug);
  return null; // Replace with actual data fetching logic
}
