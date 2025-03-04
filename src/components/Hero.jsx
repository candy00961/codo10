import Markdown from 'markdown-to-jsx';
import Image from 'next/image';
import { Button } from './Button.jsx';

const themeClassMap = {
  imgLeft: 'md:flex-row-reverse',
  imgRight: 'md:flex-row',
};

export const Hero = ({ id, heading, body, button, image, theme }) => {
  return (
    <div className="px-6 py-16 bg-gray-100 sm:px-12 sm:py-24" data-sb-object-id={id}>
      <div className={`max-w-6xl mx-auto flex flex-col gap-12 md:items-center ${themeClassMap[theme] || themeClassMap['imgRight']}`}>
        <div className="w-full max-w-xl mx-auto flex-1">
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl" data-sb-field-path="heading">
            {heading || 'Default Heading'}
          </h1>
          {body && (
            <Markdown options={{ forceBlock: true }} className="mb-6 text-lg" data-sb-field-path="body">
              {body}
            </Markdown>
          )}
          {button && <Button {...button} data-sb-field-path="button" />}
        </div>
        <div className="w-full aspect-[4/3] flex-1 relative overflow-hidden rounded-md">
          {image && (
            <Image
              src={image.src || '/placeholder.jpg'}
              alt={image.alt || 'Hero Image'}
              fill
              className="object-cover"
              sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 600px"
              data-sb-field-path="image"
            />
          )}
        </div>
      </div>
    </div>
  );
};
