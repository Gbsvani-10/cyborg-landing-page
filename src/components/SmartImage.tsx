import { useEffect, useRef, useState } from 'react';
import { Cpu } from 'lucide-react';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  aspectClassName?: string;
}

export function SmartImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  aspectClassName = '',
}: SmartImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setHasError(false);
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) {
        setIsLoaded(true);
      } else {
        setHasError(true);
      }
    } else {
      setIsLoaded(false);
    }
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-[#091226] to-[#120d26] ${aspectClassName} ${className}`}
        role="img"
        aria-label={alt}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30 cyber-grid-bg"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-slate-900/70 text-cyan-300">
            <Cpu className="h-5 w-5" aria-hidden="true" />
          </div>
          {fallbackTitle && (
            <span className="font-display text-sm font-medium tracking-wide text-slate-300">
              {fallbackTitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#070B14] ${aspectClassName}`}>
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0B1325] to-[#080B14]"
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
