// src/app/page.jsx
import { draftMode } from 'next/headers'; // Import draftMode (though not strictly needed for this fix, good practice)
import { notFound } from 'next/navigation';
import { Hero } from '../components/Hero.jsx'; // Verify path
import { Stats } from '../components/Stats.jsx'; // Verify path
import { Button } from '../components/Button.jsx'; // Verify path
// Assuming this path is correct based on your file tree
import { getPageFromSlug } from '../utils/content.js';

// ** ADD THIS LINE TO FORCE DYNAMIC RENDERING **
// This prevents Next.js from trying to prerender this page at build time.
export const dynamic = 'force-dynamic';
// *******************************************


// Map Contentful Content Type IDs to React components
// Add any other section components you might create
const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button
  // Add mappings for any other section types you might create
  // invoice: Invoice, // Uncomment if you created an <Invoice> component and want it on the homepage (unlikely for a typical homepage)
};

// Renamed component to HomePage for clarity
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
      return notFound(); // Return 404 page if homepage content is missing or invalid
    }

    // Use the actual page entry's ID for the top-level Stackbit object ID
    return (
      <div data-sb-object-id={page.sys.id}>
        {/* Safely map over the sections array */}
        {page.fields.sections.map((section) => {
          // Basic check for a valid section object structure
          if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
             if (process.env.NODE_ENV === 'development') {
                console.warn("Skipping rendering of invalid section object:", section);
             }
             return null; // Skip rendering this section
          }

          const contentTypeId = section.sys.contentType.sys.id;
          const Component = componentMap[contentTypeId];

          // Handle cases where a component isn't mapped
          if (!Component) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`No component mapped for section content type: ${contentTypeId}`);
              // Use escaped apostrophe
              return <div key={section.sys.id}>Component for '{contentTypeId}' not found</div>;
            }
            return null; // Don't render anything in production for unmapped components
          }

          // Pass the linked section's FIELDS as props, and its ID separately
          // Use the section's unique sys.id as the key
          return (
            <Component
              key={section.sys.id}
              id={section.sys.id}  // Pass the section's ID as a prop (used by the component for its data-sb-object-id)
              {...section.fields} // Spread the fields object
            />
          );
        })}
      </div>
    );
  } catch (error) {
    // Keep error logging in case something unexpected happens during fetch/render
    console.error("Error fetching or rendering homepage:", error);
    return notFound(); // Return 404 page on error
  }
}
