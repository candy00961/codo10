// src/components/Stats.jsx
import Markdown from 'markdown-to-jsx';

// Sub-component for individual stat items
const StatItem = ({ value, label, index, id }) => {
  const basePath = `stats.${index}`;

  return (
    <div data-sb-object-id={id} data-sb-field-path={basePath}>
      <div
        className="mb-3 text-4xl font-bold sm:text-5xl"
        data-sb-field-path=".value"
      >
        {value || '0'}
      </div>
      <div data-sb-field-path=".label">{label || 'Default Label'}</div>
    </div>
  );
};


// Main Stats component
const themeClassMap = {
  primary: 'bg-purple-700 text-white',
  dark: 'bg-gray-800 text-white',
};

export const Stats = ({ id, heading, body, stats, theme }) => {
  return (
    <div
      className={`px-6 py-16 text-center ${themeClassMap[theme] || themeClassMap['primary']} sm:px-12 sm:py-24`}
      data-sb-object-id={id}
    >
      <div className="mx-auto">
        <div className="mb-16">
          <h2
            className="mb-4 text-4xl font-bold sm:text-5xl"
            data-sb-field-path="heading"
          >
            {heading || 'Default Stats Heading'}
          </h2>
          {body && (
            <Markdown
              options={{ forceBlock: true }}
              className="sm:text-lg"
              data-sb-field-path="body"
            >
              {body}
            </Markdown>
          )}
        </div>
        <div
          className="grid max-w-3xl gap-12 mx-auto sm:grid-cols-3"
          data-sb-field-path="stats"
         >
          {(stats || []).map((stat, idx) => {
            if (!stat?.sys?.id || !stat.fields) {
              // Optionally log warning in dev
              if (process.env.NODE_ENV === 'development') {
                console.warn('Skipping rendering of invalid stat item object in Stats component:', stat);
              }
              return null;
            }

            return (
              <StatItem
                key={stat.sys.id}
                {...stat.fields}
                id={stat.sys.id}
                index={idx}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stats;
