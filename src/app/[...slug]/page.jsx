// src/app/[...slug]/page.jsx
import { notFound } from 'next/navigation';
import { getPageFromSlug } from '../../utils/content.js'; // Correct import
import { Hero } from '../../components/Hero.jsx';         // Correct import path
import { Stats } from '../../components/Stats.jsx';       // Correct import path
import { Button } from '../../components/Button.jsx';     // Assuming Button might be a section type or needed
// import { Invoice } from '../../components/Invoice.jsx'; // Uncomment if you create and move an Invoice component here

// Map Contentful Content Type IDs to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button,
  // Add other mappings like 'featureList', 'testimonial', etc. if you have them
};

export default async function ComposablePage({ params }) {
  try {
    const slugArray = params?.slug;
    if (!Array.isArray(slugArray) || slugArray.length === 0) {
      // console.warn("Invalid or missing slug parameter received:", params); // Removed console
      return notFound();
    }

    const joinedSlug = slugArray.join('/');
    const fullPath = joinedSlug.startsWith('/') ? joinedSlug : `/${joinedSlug}`;
    // console.log(`[ComposablePage] Processing slug: ${fullPath}`); // Removed console

    const page = await getPageFromSlug(fullPath);

    if (!page) {
      // console.log(`[ComposablePage] No content found for slug: ${fullPath}`); // Removed console
      return notFound();
    }

    if (page.sys?.contentType?.sys?.id === 'page') {
      if (!Array.isArray(page.fields?.sections)) {
        // console.warn(`Page entry '${page.sys.id}' found for slug '${fullPath}', but missing or invalid 'sections' field.`, page.fields); // Removed console
        return notFound();
      }

      return (
        <div data-sb-object-id={page.sys.id}>
          {page.fields.sections.map((section) => {
            if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
              // console.warn("[ComposablePage] Skipping rendering of invalid section object:", section); // Removed console
              return null;
            }

            const contentTypeId = section.sys.contentType.sys.id;
            const Component = componentMap[contentTypeId];

            if (!Component) {
              // console.warn(`[ComposablePage] No component mapped for section content type: ${contentTypeId}`); // Removed console
              if (process.env.NODE_ENV === 'development') {
                  // *** THIS LINE IS CORRECTED ***
                  return <div key={section.sys.id}>Component for '{contentTypeId}' not found</div>;
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
    }
    else if (page.sys?.contentType?.sys?.id === 'invoice') {
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
            </div>
        );
    }
    else {
      // console.warn(`[ComposablePage] Found content for slug '${fullPath}', but it has an unhandled type: '${page.sys?.contentType?.sys?.id}'`); // Removed console
      return notFound();
    }

  } catch (error) {
     const slugString = params?.slug?.join('/') || 'unknown';
     // console.error(`Error fetching or rendering page for slug '${slugString}':`, error); // Removed console
     return notFound();
  }
}
