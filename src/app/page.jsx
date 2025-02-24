import { notFound } from 'next/navigation';
import { Hero } from '../../components/Hero.jsx';
import { Stats } from '../../components/Stats.jsx';
import { getPageFromSlug, getPagePaths } from '../../utils/content.js';

// Invoice component (placeholder; replace with actual implementation if added later)
function Invoice({ invoiceNumber, amount, dueDate, clientName }) {
  return (
    <div>
      <h2>Invoice: {invoiceNumber || 'N/A'}</h2>
      <p>Amount: ${amount || 'N/A'}</p>
      <p>Due: {dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}</p>
      <p>Client: {clientName || 'N/A'}</p>
    </div>
  );
}

// Map content types to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
  invoice: Invoice,
};

// Dynamic page component
export default async function ComposablePage({ params }) {
  const slug = params.slug ? params.slug.join('/') : ''; // Empty string for root; content.js defaults to '/'
// Assuming this is in src/app/[...slug]/page.jsx
export default async function Page({ params }) {
  const pageSlug = Array.isArray(params?.slug) ? params.slug.join('/') : params.slug || 'home';

  try {
    const page = await getPageFromSlug(slug);
  // Fetch page data based on the slug
  const pageData = await fetchPageData(pageSlug);

    // Handle invoice pages (future-proofing)
    if (page.type === 'invoice') {
      return (
        <div data-sb-object-id={page.id}>
          <Invoice {...page} />
        </div>
      );
    }

    // Handle pages with sections (homePage or page)
    return (
      <div data-sb-object-id={page.id}>
        {(page.sections || []).map((section, idx) => {
          const Component = componentMap[section.type];
          if (!Component) {
            console.warn(`No component mapped for section type: ${section.type}`);
            return null; // Skip unknown section types
          }
          return <Component key={idx} {...section} data-sb-object-id={section.id} />;
        })}
      </div>
    );
  } catch (error) {
    console.error('Error rendering page:', error.message);
    notFound(); // Trigger Next.js 404 handling
  if (!pageData) {
    console.error('Page Slug is undefined or invalid:', pageSlug);
    return notFound();
  }

  return <Page data={pageData} />;
}

// Static generation for known paths
export async function generateStaticParams() {
  try {
    const paths = await getPagePaths();
    console.log('Generated static paths:', paths);
    return paths.map((path) => ({
      slug: path.split('/').filter(Boolean), // Convert "/invoice/inv-001" to ["invoice", "inv-001"]
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error.message);
    return []; // Fallback to empty array if paths can't be generated
  }
