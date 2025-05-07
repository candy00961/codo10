import { VisualEditorVariation } from '@stackbit/types';
import { createClient } from 'contentful';
import { Hero } from '../../components/Hero.jsx'; // Check path
import { Stats } from '../../components/Stats.jsx'; // Check path
import { Button } from '../../components/Button.jsx'; // Check path
import { notFound } from 'next/navigation';
import { getPageFromSlug } from '../../utils/content.js';

const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button
};

export const dynamic = 'force-dynamic'; // Force dynamic rendering for testing

export default async function HomePage() {
  try {
    const page = await getPageFromSlug("/", 'page');

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
              // Use escaped quotes for the error message
              return <div key={section.sys.id}>{`Component for &apos;${contentTypeId}&apos; not found`}</div>;
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
