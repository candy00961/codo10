import Markdown from 'markdown-to-jsx';

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
          <h2 className="mb-4 text-4xl font-bold sm:text-5xl" data-sb-field-path="heading">
            {heading || 'Default Stats Heading'}
          </h2>
          {body && (
            <Markdown options={{ forceBlock: true }} className="sm:text-lg" data-sb-field-path="body">
              {body}
            </Markdown>
          )}
        </div>
        <div className="grid max-w-3xl gap-12 mx-auto sm:grid-cols-3">
          {(stats || []).map((stat, idx) => (
            <StatItem key={stat.id || idx} {...stat} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ value, label}) => {
  return (
    <div data-sb-field-path={`stats.${index}`}>
      <div className="mb-3 text-4xl font-bold sm:text-5xl" data-sb-field-path={`stats.${index}.value`}>
        {value || '0'}
      </div>
      <div data-sb-field-path={`stats.${index}.label`}>{label || 'Default Label'}</div>
    </div>
  );
};
