import Link from 'next/link';

export function Button({ href, label }) {
  if (!href) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Missing href in <Button>');
    }
    return null; // Prevent Link error
  }

  return (
    <Link href={href}>
      <button>{label}</button>
    </Link>
  );
}
