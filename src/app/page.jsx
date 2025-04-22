// src/app/page.jsx
import { notFound } from 'next/navigation';
import { Hero } from '../components/Hero.jsx'; // Verify path
import { Stats } from '../components/Stats.jsx'; // Verify path
import { Button } from '../components/Button.jsx';
import { getPageFromSlug } from '../utils/content.js'; // Verify path

// Map Contentful Content Type IDs to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button
  // Add mappings for any other section types you might create
};

export default async function page() {
  try {
    // Fetch the 'page' entry with slug '/'
    // Assuming getPageFromSlug handles the specific 'page' type lookup for '/'
    const pageData = await getPageFromSlug("/", 'page'); // Explicitly request 'page' type

    // Check if the page, its fields, or the sections array are missing
    if (!pageData || !pageData.fields || !Array.isArray(pageData.fields.sections)) {
      // console.error("Error: Homepage ('/' page entry) not found, missing fields, or missing sections.", pageData); // Removed console
      return notFound();
    }

    // Use the actual page entry's ID for the top-level Stackbit object ID
    return (
      <div data-sb-object-id={pageData.sys.id}>
        {/* Map over the sections array */}
        {pageData.fields.sections.map((section) => {
          // Basic check for a valid section object structure
          if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
            // console.warn("Skipping rendering of invalid section object:", section); // Removed console
            return null;
          }

          // Get the Content Type ID of the linked section entry
          const contentTypeId = section.sys.contentType.sys.id;
          const Component = componentMap[contentTypeId];

          // Handle cases where a component isn't mapped
          if (!Component) {
            // console.warn(`No component mapped for section content type: ${contentTypeId}`); // Removed console
            if (process.env.NODE_ENV === 'development') {
              return <div key={section.sys.id}>Component for '{contentTypeId}' not found</div>;
            }
            return null;
          }

          // Pass the linked section's FIELDS as props, and its ID separately
          // Use the section's unique sys.id as the key
          return <Component key={section.sys.id} {...section.fields} id={section.sys.id} />;
        })}
      </div>
    );
  } catch (error) {
    // console.error("Error fetching or rendering homepage:", error); // Removed console
    return notFound(); // Return 404 page on error
  }
}
