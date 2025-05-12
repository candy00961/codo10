import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';
import { Button } from '../components/Button.jsx';
import { getPageFromSlug } from '../utils/content.js';

export const dynamic = 'force-dynamic';

// Map Contentful content types to components
const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button,
};

export default async function HomePage() {
  // ✅ Correctly await draftMode()
  let isPreview = false;
  try {
    const { isEnabled } = await draftMode();
    isPreview = isEnabled;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('draftMode not available, assuming production:', e);
    }
  }

  try {
    const page = await getPageFromSlug('/', 'page', isPreview);

    // Handle missing or malformed content
    if (!page || !Array.isArray(page.fields?.sections)) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Homepage ('/' entry) not found or malformed:", page);
      }
      return notFound();
    }

    return (
      <div data-sb-object-id={page.sys.id}>
        {page.fields.sections.map((section) => {
          const contentTypeId = section?.sys?.contentType?.sys?.id;
          const sectionId = section?.sys?.id;

          if (!contentTypeId || !section.fields || !sectionId) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Skipping invalid section:', section);
            }
            return null;
          }

          const Component = componentMap[contentTypeId];

          if (!Component) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`No component mapped for ${contentTypeId}`);
              return (
                <div key={sectionId}>
                  Component for &apos;{contentTypeId}&apos; not found
                </div>
              );
            }
            return null;
          }

          // ✅ Safe render with required props
          return (
            <Component
              key={sectionId}
              id={sectionId}
              {...section.fields}
            />
          );
        })}
      </div>
    );
  } catch (error) {
    console.error('Error rendering homepage:', error);
    return notFound();
  }
}
