import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers'; // ✅ FIX: Import this
import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';
import { Button } from '../components/Button.jsx';
import { getPageFromSlug } from '../utils/content.js';

export const dynamic = 'force-dynamic';

const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button
};

export default async function HomePage() {
  let isPreview = false;

  try {
    // ✅ FIX: Await draftMode properly
    const { isEnabled } = await draftMode();
    const isPreview = isEnabled;

  } catch (e) {
    console.warn('draftMode not available, assuming production:', e);
  }

  try {
    const page = await getPageFromSlug("/", 'page', isPreview); // 🔁 optional: pass preview flag

    if (!page || !Array.isArray(page.fields?.sections)) {
      if (process.env.NODE_ENV === 'development') {
         console.error("Homepage ('/' page entry) not found or malformed.", page);
      }
      return notFound();
    }

    return (
      <div data-sb-object-id={page.sys.id}>
        {page.fields.sections.map((section) => {
          if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
             if (process.env.NODE_ENV === 'development') {
                console.warn("Skipping invalid section:", section);
             }
             return null;
          }

          const contentTypeId = section.sys.contentType.sys.id;
          const Component = componentMap[contentTypeId];

          if (!Component) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`No component mapped for ${contentTypeId}`);
              return <div key={section.sys.id}>Component for &apos;{contentTypeId}&apos; not found</div>;
            }
            return null;
          }

          return (
            <Component
              key={section.sys.id}
              id={section.sys.id}
              {...section.fields}
            />
          );
        })}
      </div>
    );
  } catch (error) {
    console.error("Error rendering homepage:", error);
    return notFound();
  }
}
