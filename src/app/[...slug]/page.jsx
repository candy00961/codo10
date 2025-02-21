import { notFound } from 'next/navigation';
import { Hero } from '../../components/Hero.jsx';
import { Stats } from '../../components/Stats.jsx';
import { getPageFromSlug, getPagePaths } from '../../utils/content.js';

// Invoice component (placeholder; replace with your actual implementation if different)
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

// Map content types to React components
const componentMap = {
  hero: Hero,
  stats: Stats,
  invoice: Invoice,
};

// Dynamic page component
export default async function ComposablePage({ params }) {
  const slug = params.slug ? params.slug.join('/') : '';
