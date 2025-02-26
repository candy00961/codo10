'use client';

export default function GlobalError({ error }) {
  // console.error('Global error occurred:', error);
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => window.location.reload()}>Try again</button>
      </body>
    </html>
  );
}
