// src/components/Stats.jsx
import Markdown from 'markdown-to-jsx';

// Sub-component for individual stat items
const StatItem = ({ value, label, index, id }) => { // Assuming `id` (sys.id of the StatItem entry) might be useful, added it here.
  // Use the index for the field path as it corresponds to the array position in Contentful field
  const basePath = `stats.${index}`;

  return (
    // Add the object ID for the StatItem entry itself for better editing context
    <div data-sb-object-id={id} data-sb-field-path={basePath}>
      <div
        className="mb-3 text-4xl font-bold sm:text-5xl"
        // Field path for the value field within the specific StatItem
        data-sb-field-path=".value"
      >
        {value || '0'} {/* Default value if missing */}
      </div>
      {/* Field path for the label field within the specific StatItem */}
      <div data-sb-field-path=".label">{label || 'Default Label'}</div> {/* Default value if missing */}
    </div>
  );
};


// Main Stats component
const themeClassMap = {
  primary: 'bg-purple-700 text-white',
  dark: 'bg-gray-800 text-white',
};

export const Stats = ({ id, heading, body, stats, theme }) => {
  // `id` here refers to the sys.id of the parent "Stats" section entry from Contentful
  // `stats` is the array of linked "StatItem" entries

  return (
    <div
      className={`px-6 py-16 text-center ${themeClassMap[theme] || themeClassMap['primary']} sm:px-12 sm:py-24`}
      // Set the object ID for the main Stats section
      data-sb-object-id={id}
    >
      <div className="mx-auto">
        <div className="mb-16">
          <h2
            className="mb-4 text-4xl font-bold sm:text-5xl"
            // Field path for the heading field of the Stats section
            data-sb-field-path="heading"
          >
            {heading || 'Default Stats Heading'} {/* Default value */}
          </h2>
          {body && (
            <Markdown
              options={{ forceBlock: true }}
              className="sm:text-lg"
              // Field path for the body field of the Stats section
              data-sb-field-path="body"
            >
              {body}
            </Markdown>
          )}
        </div>
        <div
          className="grid max-w-3xl gap-12 mx-auto sm:grid-cols-3"
          // Field path for the array field linking to StatItems
          data-sb-field-path="stats"
         >
          {(stats || []).map((stat, idx) => { // 'stat' is the linked Contentful StatItem entry object
            // *** FIX APPLIED HERE ***
            // Safety check: Ensure the linked entry and its fields exist
            if (!stat?.sys?.id || !stat.fields) {
              // Optionally log a warning during development
              if (process.env.NODE_ENV === 'development') {
                console.warn('Skipping rendering of invalid stat item object:', stat);
              }
              return null; // Don't render anything for invalid entries
            }

            // Pass fields from the linked StatItem entry as props
            // Pass the StatItem's own Contentful ID as the 'id' prop
            // Pass the array index as the 'index' prop for field path generation
            return (
              <StatItem
                key={stat.sys.id} // Use unique Contentful ID for the key
                {...stat.fields}  // *** Spread the 'fields' object, not the whole 'stat' object ***
                id={stat.sys.id}  // Pass the StatItem's own ID
                index={idx}       // Pass the index for data-sb-field-path
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export the main component if needed elsewhere (though typically used via mapping)
export default Stats;
