import { notFound } from 'next/navigation';
import { Hero } from '../../components/Hero.jsx';
import { Stats } from '../../components/Stats.jsx';
import { getPageFromSlug } from '../../utils/content.js';

// Placeholder Invoice component (create this in your project)
function Invoice({ invoiceNumber, amount, dueDate, clientName }) {
  return (
    <div>
      <h2>Invoice: {invoiceNumber}</h2>
      <p>Amount: ${amount}</p>
      <p>Due: {new Date(dueDate).toLocaleDateString()}</p>
      <p>Client: {clientName}</p>
    </div>
  );
}

const componentMap = {
  hero: Hero,
  stats: Stats,
  invoice: Invoice,
};

export default async function ComposablePage({ params }) {
  const slug = params.slug ? params.slug.join('/') : ''; // Avoid prepending / here; content.js handles it

  try {
    const page = await getPageFromSlug(slug);

    // If page is an invoice, render it directly
    if (page.type === 'invoice') {
      return (
        <div data-sb-object-id={page.id}>
          <Invoice {...page} />
        </div>
      );
    }

    // Otherwise, render page sections (e.g., homePage or page)
    return (
      <div data-sb-object-id={page.id}>
        {(page.sections || []).map((section, idx) => {
          const Component = componentMap[section.type];
          if (!Component) {
            console.warn(`No component mapped for section type: ${section.type}`);
            return null;
          }
          return <Component key={idx} {...section} data-sb-object-id={section.id} />;
        })}
      </div>
    );
  } catch (error) {
    console.error('Error rendering page:', error);
    return notFound();
  }
}

// Optional: Static generation for known paths
export async function generateStaticParams() {
  const { getPagePaths } = await import('../../utils/content.js');
  const paths = await getPagePaths();
  return paths.map((path) => ({
    slug: path.split('/').filter(Boolean), // Convert '/invoice/inv-001' to ['invoice', 'inv-001']
  }));
}
