import { notFound } from 'next/navigation';
import { getPageFromSlug } from '../utils/content.js';
import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';



export default async function ComposablePage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const pageSlug = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    const page = await getPageFromSlug(pageSlug);

    if (!page) {
      return notFound();
    }

    return (
      <div data-sb-object-id={page.id}>
        {(page.sections || []).map((section, idx) => {
          const Component = componentMap[section.type];
          return <Component key={idx} {...section} />;
        })}
      </div>
    );
  } catch (error) {
    console.error(error.message);
    return notFound();
  }
}
