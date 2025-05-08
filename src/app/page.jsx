// src/app/page.jsx
// FIX: Corrected import paths from '../../' to '../'
import { notFound } from 'next/navigation';
import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';
import { Button } from '../components/Button.jsx';
import { getPageFromSlug } from '../utils/content.js';

// Keep this line if you want to continue testing dynamic rendering
// Remove it if you want to attempt static generation for the homepage again
export const dynamic = 'force-dynamic';

// Map Contentful Content Type IDs to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button
};

export default async function HomePage() {
  try {
    // Fetch the 'page' entry with slug '/'
    // Explicitly request 'page' content type for the homepage slug
    const page = await getPageFromSlug("/", 'page');

    // Check if the page, its fields, or the sections array are missing
    if (!page || !Array.isArray(page.fields?.sections)) {
      if (process.env.NODE_ENV === 'development') {
         console.error("Error: Homepage ('/' page entry, type 'page') not found, missing fields, or missing sections.", page);
      }
      return notFound();
    }

    return (
      <div data-sb-object-id={page.sys.id}>
        {page.fields.sections.map((section) => {
          if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
             if (process.env.NODE_ENV === 'development') {
                console.warn("Skipping rendering of invalid section object:", section);
             }
             return null;
          }

          const contentTypeId = section.sys.contentType.sys.id;
          const Component = componentMap[contentTypeId];

          if (!Component) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`No component mapped for section content type: ${contentTypeId}`);
              // Use escaped apostrophe
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
    console.error("Error fetching or rendering homepage:", error);
    return notFound();
  }
}
