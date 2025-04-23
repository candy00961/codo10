// src/app/[...slug]/page.jsx
import { notFound } from 'next/navigation';
import { getPageFromSlug } from '../../utils/content.js';
import { Hero } from '../../components/Hero.jsx';
import { Stats } from '../../components/Stats.jsx';
import { Button } from '../../components/Button.jsx';
// import { Invoice } from '../../components/Invoice.jsx'; // Uncomment if you create and move an Invoice component here

// Map Contentful Content Type IDs to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
  button: Button,
};

export default async function ComposablePage({ params }) {
  try {
    const slugArray = params?.slug;
    if (!Array.isArray(slugArray) || slugArray.length === 0) {
      return notFound();
    }

    const joinedSlug = slugArray.join('/');
    const fullPath = joinedSlug.startsWith('/') ? joinedSlug : `/${joinedSlug}`;

    const page = await getPageFromSlug(fullPath);

    if (!page) {
      return notFound();
    }

    // --- Handle 'page' type entries ---
    if (page.sys?.contentType?.sys?.id === 'page') {
      if (!Array.isArray(page.fields?.sections)) {
        return notFound();
      }

      return (
        <div data-sb-object-id={page.sys.id}>
          {page.fields.sections.map((section) => {
            if (!section?.sys?.contentType?.sys?.id || !section.fields || !section.sys.id) {
              return null; // Skip invalid sections
            }

            const contentTypeId = section.sys.contentType.sys.id;
            const Component = componentMap[contentTypeId];

            // Handle cases where a component isn't mapped
            if (!Component) {
              // *** FIX: Use ' and removed console.warn ***
              if (process.env.NODE_ENV === 'development') {
                return <div key={section.sys.id}>Component for {contentTypeId} not found</div>;
              }
              return null;
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
    // --- Handle 'invoice' type entries ---
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
    // --- Handle unknown content types ---
    else {
      return notFound();
    }

  } catch (error) {
     // *** FIX: Removed console.error, rely on global error handling or Sentry ***
     // Log the error for debugging in development, but avoid console in production
     if (process.env.NODE_ENV === 'development') {
        console.error(`Error fetching or rendering page for slug '${params?.slug?.join('/') || 'unknown'}':`, error);
     }
     return notFound();
  }
}
