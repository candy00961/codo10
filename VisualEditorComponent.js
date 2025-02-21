'use client'; // Client component for hooks

import { useContentfulLivePreview } from '@contentful/live-preview';
import { useEffect, useState } from 'react';

function VisualEditorComponent({ entryId, fieldId, locale = 'en-US' }) {
  const [liveContent, setLiveContent] = useState(null);

  useEffect(() => {
    console.log('[VisualEditorComponent] Initializing with:', { entryId, fieldId, locale });
    const subscription = useContentfulLivePreview.subscribe({
      entryId,
      fieldId,
      locale,
      onChange: (data) => {
        console.log('[VisualEditorComponent] Live preview updated:', data);
        setLiveContent(data);
      },
    });

    return () => subscription.unsubscribe();
  }, [entryId, fieldId, locale]);

  if (!liveContent) {
    return <div>Loading live preview...</div>;
  }

  return <div data-sb-field-path={fieldId}>{liveContent || 'No content available'}</div>;
}

export default VisualEditorComponent;
