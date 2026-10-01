import React, { useState, useEffect } from 'react';

interface TransparentLogoProps {
  src: string;
  alt?: string;
  className?: string;
}

export function TransparentLogo({
  src,
  alt = 'Rodrigo Barbeiro - Logo Oficial',
  className = '',
}: TransparentLogoProps) {
  // Prefer the pre-rendered transparent asset if src is the postimg URL
  const initialSrc =
    src.includes('SNHdgM96') || !src
      ? '/logomarca-rodrigo-transparente.png'
      : src;

  const [processedSrc, setProcessedSrc] = useState<string>(initialSrc);

  useEffect(() => {
    // If src is the postimg URL, use the guaranteed transparent local PNG
    if (src.includes('SNHdgM96')) {
      setProcessedSrc('/logomarca-rodrigo-transparente.png');
      return;
    }

    // Otherwise try to process custom external images on canvas if possible
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Check if top-left corner is black or near-black
        const r0 = data[0];
        const g0 = data[1];
        const b0 = data[2];

        const isDarkBg = r0 < 30 && g0 < 30 && b0 < 30;

        if (isDarkBg) {
          // Remove dark background
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (r <= 15 && g <= 15 && b <= 15) {
              data[i + 3] = 0; // 100% transparent
            } else if (luminance < 35) {
              data[i + 3] = Math.round(((luminance - 15) / 20) * 255);
            }
          }
          ctx.putImageData(imgData, 0, 0);
          if (isMounted) {
            setProcessedSrc(canvas.toDataURL('image/png'));
          }
        }
      } catch (err) {
        // Cross-origin restriction fallback: rely on mixBlendMode screen
        if (isMounted) {
          setProcessedSrc(src);
        }
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setProcessedSrc('/logomarca-rodrigo-transparente.png');
      }
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <img
        src={processedSrc}
        alt={alt}
        className={`w-full h-auto object-contain transition duration-500 ${className}`}
        style={{
          mixBlendMode: 'screen',
          filter: 'drop-shadow(0 6px 16px rgba(212, 175, 55, 0.3))',
        }}
        loading="eager"
      />
    </div>
  );
}
