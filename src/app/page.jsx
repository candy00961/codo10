import { notFound } from 'next/navigation';
import { createClient } from 'contentful';
import { Hero } from '../../components/Hero';
import { Stats } from '../../components/Stats';

// Map Contentful section types to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
  // Add more mappings as needed, e.g., 'feature': FeatureComponent
};

export default async function Page({ params, searchParams }) {
  // Safely access searchParams.preview with a fallback
  const isPreview = searchParams?.preview === 'true' || false;

  // Handle pageSlug from params
  const pageSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params.slug || 'home';

  // Fetch page data (assuming this function exists)
  const pageData = await fetchPageData(pageSlug, isPreview);

  if (!pageData) {
    return notFound(); // Trigger a 404 if no data is found
  }

  // Render the page
  return (
    <div data-sb-object-id={pageData.sys.id}>
      {(pageData.fields.sections || []).map((section, idx) => {
        const Component = componentMap[section.type];
        if (!Component) {
          if (process.env.NODE_ENV === 'development') {
            // console.warn(`No component found for section type: ${section.type}`);
          }
          return null;
        }
        return (
 ▋
