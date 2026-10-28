import { useState } from 'react';

export default function PortadaLibro({ src, title }) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = typeof src === 'string' ? src.replace(/^http:\/\//i, 'https://') : '';

  if (!imageUrl || hasError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-high p-4 text-center">
        <span className="material-symbols-outlined mb-2 text-[36px] text-outline">menu_book</span>
        <span className="text-label-sm font-label-sm font-medium text-on-surface-variant">Portada no disponible</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={title ? `Portada de ${title}` : 'Portada del libro'}
      className="absolute inset-0 z-0 h-full w-full object-cover"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
