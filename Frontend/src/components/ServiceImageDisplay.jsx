import React from 'react';

function ServiceImageDisplay({ images, serviceTitle }) {
  // Check if this is the Browser Extension service
  const isBrowserExtension = serviceTitle === 'Browser Extension';

  return (
    <div
      className={`flex-1 min-w-0 w-full ${
        isBrowserExtension
          ? 'lg:max-w-2xl xl:max-w-3xl'
          : 'lg:w-auto lg:max-w-md xl:max-w-lg'
      }`}
    >
      <div
        className={`flex ${
          images.length === 1
            ? 'justify-center'
            : isBrowserExtension
            ? 'flex-col gap-3 sm:gap-4'
            : 'flex-wrap justify-start gap-2 sm:gap-3 lg:gap-4'
        }`}
      >
        {images.map((image, imgIdx) => (
          <div
            key={imgIdx}
            className={`relative group rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 ${
              images.length === 1
                ? 'w-full max-w-[280px] sm:max-w-xs mx-auto'
                : isBrowserExtension
                ? 'w-full'
                : 'flex-1 min-w-[140px] sm:min-w-[200px] max-w-[200px] sm:max-w-[280px]'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-auto object-cover bg-slate-800/50 rounded-lg sm:rounded-xl"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 sm:p-3 lg:p-4">
              <p className="text-white text-xs sm:text-sm font-medium">
                {image.alt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceImageDisplay;
