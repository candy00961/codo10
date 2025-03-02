import { notFound } from 'next/navigation';
import { createClient } from 'contentful';
import { Hero } from '../components/Hero.jsx';  // Fixed path
import { Stats } from '../components/Stats.jsx';  // Fixed path

// Map Contentful section types to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
};

export default async function Page({ params, searchParams }) {
  const isPreview = searchParams?.preview === 'true' || false;
  const pageSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params.slug || 'home';
  const pageData = await fetchPageData(pageSlug, isPreview);

  if (!pageData) {
    return notFound();
  }

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
          <Component
            key={idx}
            {...section}
            id={section.sys?.id || `${pageData.sys.id}-${idx}`}
          />
        );
      })}
    </div>
  );
}

async function fetchPageData(pageSlug, isPreview = false) {
  const accessToken = isPreview
    ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_TOKEN
    : process.env.CONTENTFUL_DELIVERY_TOKEN;

  const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken,
  });

  try {
    const response = await client.getEntries({
      content_type: 'homePage',
      'fields.slug': pageSlug,
      include: 2,
    });

    if (response.items.length === 0) {
      return null;
    }

    return response.items[0];
  } catch (error) {
    // console.error(`Error fetching page data for slug "${pageSlug}":`, error);
    return null;
  }
}
