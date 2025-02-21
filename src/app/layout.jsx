import { ContentfulLivePreviewProvider } from '@contentful/live-preview';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ContentfulLivePreviewProvider
          space={process.env.CONTENTFUL_SPACE_ID}
          accessToken={process.env.CONTENTFUL_PREVIEW_TOKEN}
          enableLiveUpdates={true}
          locale="en-US"
        >
          {children}
        </ContentfulLivePreviewProvider>
      </body>
    </html>
  );
}
