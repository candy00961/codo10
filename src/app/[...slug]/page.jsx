// src/app/[...slug]/page.jsx
import { notFound } from 'next/navigation';
import { getPageFromSlug } from '../../utils/content.js'; // Correct import
import { Hero } from '../../components/Hero.jsx';         // Correct import path
import { Stats } from '../../components/Stats.jsx';       // Correct import path
import { Button } from '../../components/Button.jsx';     // Assuming Button might be a section type or needed
// import { Invoice } from '../../components/Invoice.jsx'; // Uncomment if you create and move an Invoice component here

// Map Contentful Content Type IDs to React components
// Add any other section components you use here
const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button,
  // Add other mappings like 'featureList', 'testimonial', etc. if you have them
};

// The main Page component for dynamic slugs
export default async function ComposablePage({ params }) {
  try {
    // 1. Process the slug from params
    const slugArray = params?.slug;
    if (!Array.isArray(slugArray) || slugArray.length === 0) {
      console.warn("Invalid or missing slug parameter received:", params);
      return notFound();
    }

    const joinedSlug = slugArray.join('/');
    const fullPath = joinedSlug.startsWith('/') ? joinedSlug : `/${joinedSlug}`;
    console.log(`[ComposablePage] Processing slug: ${fullPath}`); // Keep for debugging if needed

    // 2. Fetch the Contentful entry based on the slug
    const page = await getPageFromSlug(fullPath);

    // 3. Handle cases where no entry is found
    if (!page) {
      console.log(`[ComposablePage] No content found for slug: ${fullPath}`); // Keep for debugging if needed
      return notFound();
    }

    // --- 4. Handle 'page' type entries ---
    if (page.sys?.contentType?.sys?.id === 'page') {
      if (!Array.isArray(page.fields?.sections)) {
        console.warn(`Page entry '${page.sys.id}' found for slug '${fullPath}', but missing or invalid 'sections' field.`, page.fields); // Keep for debugging if needed
        return notFound();
      }

      return (
        <div data-sb-object-id={page.sys.id}>
          {page.fields.sections.map((section) => {
            if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
              console.warn("[ComposablePage] Skipping rendering of invalid section object:", section); // Keep for debugging if needed
              return null;
            }

            const contentTypeId = section.sys.contentType.sys.id;
            const Component = componentMap[contentTypeId];

            // Handle cases where a component isn't mapped
            if (!Component) {
              console.warn(`[ComposablePage] No component mapped for section content type: ${contentTypeId}`); // Keep for debugging if needed
              // Optionally render a placeholder in development
              if (process.env.NODE_ENV === 'development') {
                  // *** THIS LINE IS CORRECTED ***
                  return <div key={section.sys.id}>Component for '{contentTypeId}' not found</div>;
              }
              return null; // Don't render anything in production for unmapped components
            }

            // Render the mapped component
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
    }
    // --- 5. Handle 'invoice' type entries ---
    else if (page.sys?.contentType?.sys?.id === 'invoice') {
        // Example rendering for an invoice type. Adapt fields as necessary.
        return (
            <div data-sb-object-id={page.sys.id} style={{ padding: '2rem', border: '1px solid #eee', margin: '1rem' }}>
                <h1>Invoice Details</h1>
                <p>
                  <strong>Invoice Slug (from URL):</strong> {slugArray.join('/')}
                </p>
                 <p data-sb-field-path="invoiceNumber">
                   <strong>Invoice Number:</strong> {page.fields?.invoiceNumber || 'N/A'}
                 </p>
                 <p data-sb-field-path="clientName">
                   <strong>Client:</strong> {page.fields?.clientName || 'N/A'}
                 </p>
                 <p data-sb-field-path="amount">
                   <strong>Amount:</strong> ${page.fields?.amount?.toFixed(2) || '0.00'}
                 </p>
                 <p data-sb-field-path="dueDate">
                   <strong>Due Date:</strong> {page.fields?.dueDate ? new Date(page.fields.dueDate).toLocaleDateString() : 'N/A'}
                 </p>
                 {/* Add other invoice fields and their data-sb-field-path annotations */}

                 {/* If you have a dedicated Invoice component: */}
                 {/* <Invoice {...page.fields} id={page.sys.id} /> */}
            </div>
        );
    }
    // --- 6. Handle unknown content types ---
    else {
      console.warn(`[ComposablePage] Found content for slug '${fullPath}', but it has an unhandled type: '${page.sys?.contentType?.sys?.id}'`); // Keep for debugging if needed
      return notFound();
    }

  } catch (error) {
     // 7. Catch and log any errors during the process
     const slugString = params?.slug?.join('/') || 'unknown';
     console.error(`Error fetching or rendering page for slug '${slugString}':`, error); // Keep for debugging if needed
     return notFound();
  }
}
