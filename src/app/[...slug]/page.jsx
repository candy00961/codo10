// src/app/[...slug]/page.jsx
import { notFound } from 'next/navigation';
import { getPageFromSlug } from '../../utils/content.js'; // Correct import
import { Hero } from '../../components/Hero.jsx';         // Correct import path
import { Stats } from '../../components/Stats.jsx';       // Correct import path
import { Button } from '../../components/Button.jsx';     // Assuming Button might be a section type or needed
// import { Invoice } from '../../components/Invoice.jsx'; // Uncomment if you have an Invoice component

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
    // Ensure params and slug exist and are an array
    const slugArray = params?.slug;
    if (!Array.isArray(slugArray) || slugArray.length === 0) {
      console.warn("Invalid or missing slug parameter received:", params);
      return notFound(); // Render 404 if slug is invalid
    }

    // Join slug parts and ensure it starts with '/' (getPageFromSlug likely expects this)
    const joinedSlug = slugArray.join('/');
    const fullPath = joinedSlug.startsWith('/') ? joinedSlug : `/${joinedSlug}`;
    console.log(`[ComposablePage] Processing slug: ${fullPath}`);

    // 2. Fetch the Contentful entry based on the slug
    // getPageFromSlug determines the Contentful type ('page' or 'invoice')
    const page = await getPageFromSlug(fullPath);

    // 3. Handle cases where no entry is found
    if (!page) {
      console.log(`[ComposablePage] No content found for slug: ${fullPath}`);
      return notFound(); // Render 404 if page data is null
    }

    // --- 4. Handle 'page' type entries ---
    if (page.sys?.contentType?.sys?.id === 'page') {
      // Ensure the page has the expected 'sections' field and it's an array
      if (!Array.isArray(page.fields?.sections)) {
        console.warn(`Page entry '${page.sys.id}' found for slug '${fullPath}', but missing or invalid 'sections' field.`, page.fields);
        // Depending on requirements, you might render a partial page or a 404
        return notFound(); // Render 404 if sections are missing/invalid
      }

      return (
        // Add Stackbit object ID for the page entry
        <div data-sb-object-id={page.sys.id}>
          {page.fields.sections.map((section) => {
            // Safety check for each section object
            if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
              console.warn("[ComposablePage] Skipping rendering of invalid section object:", section);
              return null; // Skip rendering this section
            }

            const contentTypeId = section.sys.contentType.sys.id;
            const Component = componentMap[contentTypeId];

            // Handle cases where a component isn't mapped
            if (!Component) {
              console.warn(`[ComposablePage] No component mapped for section content type: ${contentTypeId}`);
              // Optionally render a placeholder in development
              if (process.env.NODE_ENV === 'development') {
                  // *** CORRECTED LINE ***
                  return <div key={section.sys.id}>Component for '{contentTypeId}' not found</div>;
              }
              return null; // Don't render anything in production for unmapped components
            }
            // Render the mapped component, passing section fields as props
            // and the section's Contentful ID as the 'id' prop (used for data-sb-object-id within the component)
            return (
              <Component
                key={section.sys.id} // Use unique Contentful ID for the key
                id={section.sys.id}  // Pass the section's ID as a prop
                {...section.fields} // Spread the fields of the section entry
              />
            );
          })}
        </div>
      );
    }
    // --- 5. Handle 'invoice' type entries ---
    else if (page.sys?.contentType?.sys?.id === 'invoice') {
        // Example rendering for an invoice type. Adapt fields as necessary.
        // Assumes your 'invoice' content type has fields like 'slug', 'invoiceNumber', 'clientName', 'amount', 'dueDate' etc.
        // If you created an <Invoice> component, import and use it here.
        return (
            <div data-sb-object-id={page.sys.id} style={{ padding: '2rem', border: '1px solid #eee', margin: '1rem' }}>
                <h1>Invoice Details</h1>
                {/* Add Stackbit field path annotations */}
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
                 {/* Add other invoice fields as needed */}

                 {/* Example using a dedicated Invoice component: */}
                 {/* <Invoice {...page.fields} id={page.sys.id} /> */}
            </div>
        );
    }
    // --- 6. Handle unknown content types ---
    else {
      console.warn(`[ComposablePage] Found content for slug '${fullPath}', but it has an unhandled type: '${page.sys?.contentType?.sys?.id}'`);
      return notFound(); // Render 404 for unhandled types
    }

  } catch (error) {
     // 7. Catch and log any errors during the process
     const slugString = params?.slug?.join('/') || 'unknown';
     console.error(`Error fetching or rendering page for slug '${slugString}':`, error);
     // Render 404 page on error
     return notFound();
  }
}
