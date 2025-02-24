import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const pageSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params.slug || 'home';
  const pageData = await fetchPageData(pageSlug);

  if (!pageData) {
    return notFound();
  }

  return <div>{/* Render your page with pageData */}</div>;
}

async function fetchPageData(pageSlug) {
  // Use pageSlug to avoid unused variable error
  console.log('Fetching data for:', pageSlug); // Temporary, replace with real logic
  // Example: const response = await fetch(`https://api.example.com/${pageSlug}`);
  return null; // Replace with actual data
}
