// src/app/page.jsx
import { notFound } from 'next/navigation';
import { Hero } from '../components/Hero.jsx';
import { Stats } from '../components/Stats.jsx';
import { Button } from '../components/Button.jsx';
import { getPageFromSlug } from '../utils/content.js';

// Map Contentful Content Type IDs to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button
};

export default async function page() {
  try {
    // Fetch the 'page' entry with slug '/'
    const pageData = await getPageFromSlug("/", 'page');

    // Check if the page, its fields, or the sections array are missing
    if (!pageData || !pageData.fields || !Array.isArray(pageData.fields.sections)) {
      // *** FIX: Removed console.error ***
      if (process.env.NODE_ENV === 'development') {
        console.error("Homepage ('/' page entry) not found, missing fields, or missing sections.", pageData);
      }
      return notFound();
    }

    // Use the actual page entry's ID for the top-level Stackbit object ID
    return (
      <div data-sb-object-id={pageData.sys.id}>
        {/* Map over the sections array */}
        {pageData.fields.sections.map((section) => {
          // Basic check for a valid section object structure
          if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
             // *** FIX: Removed console.warn ***
             if (process.env.NODE_ENV === 'development') {
                console.warn("Skipping rendering of invalid section object on homepage:", section);
             }
             return null;
          }

          // Get the Content Type ID of the linked section entry
          const contentTypeId = section.sys.contentType.sys.id;
          const Component = componentMap[contentTypeId];

          // Handle cases where a component isn't mapped
          if (!Component) {
            // *** FIX: Removed console.warn and used ' ***
            if (process.env.NODE_ENV === 'development') {
               console.warn(`No component mapped for section content type: ${contentTypeId} on homepage`);
               return <div key={section.sys.id}>Component for '{contentTypeId}' not found</div>;
            }
            return null;
          }

          // Pass the linked section's FIELDS as props, and its ID separately
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
    // *** FIX: Removed console.error ***
    if (process.env.NODE_ENV === 'development') {
       console.error("Error fetching or rendering homepage:", error);
    }
    return notFound(); // Return 404 page on error
  }
}
