import { notFound } from 'next/navigation';
import { getPageFromSlug } from '../utils/content.js';
import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';

const componentMap = {
  hero: Hero,
  stats: Stats,
};

export default async function ComposablePage({ params }) {
  const pageSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params.slug || '';
  if (!pageSlug) {
    console.error('Page Slug is undefined or invalid');
    return notFound();
  }
  console.log('Page Slug:', pageSlug);

  try {
    const page = await getPageFromSlug(pageSlug);

    if (!page) {
      console.error(`Page not found for slug: ${pageSlug}`);
      return notFound();
    }

    return (
      <div data-sb-object-id={page.id}>
        {(page.sections || []).map((section, idx) => {
          const Component = componentMap[section.type] || (() => <div>Unknown section: {section.type}</div>);
          return <Component key={idx} {...section} />;
        })}
      </div>
    );
  } catch (error) {
    console.error('Error fetching page data:', error.message, error.stack);
    return notFound();
  }
}
