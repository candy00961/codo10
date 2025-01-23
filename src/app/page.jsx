import { notFound } from 'next/navigation';
import { getPageFromSlug } from '../utils/content.js';
import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';

const componentMap = {
  hero: Hero,
  stats: Stats,
};

export default async function ComposablePage({ params }) {
  // Handle potential missing or incorrect params
  const pageSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params.slug || '';

  try {
    const page = await getPageFromSlug(pageSlug);

    if (!page) {
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
    console.error('Error fetching page data:', error);
    return notFound();
  }
}

