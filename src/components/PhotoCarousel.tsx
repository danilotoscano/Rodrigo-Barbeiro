import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { RODRIGO_REAL_IMAGES } from '../config/rodrigoDefaults';

interface PhotoCarouselProps {
  customImages?: string[];
  onBookClick?: () => void;
}

export function PhotoCarousel({ customImages, onBookClick }: PhotoCarouselProps) {
  const images = customImages && customImages.length > 0 
    ? customImages.map((url, i) => ({
        url,
        title: RODRIGO_REAL_IMAGES[i]?.title || `Corte & Estilo #${i + 1}`,
        category: RODRIGO_REAL_IMAGES[i]?.category || 'Trabalho do Rodrigo'
      }))
    : RODRIGO_REAL_IMAGES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Autoplay
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, images.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 35) {
      handleNext();
    } else if (diff < -35) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section 
      className="w-full my-4 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Galeria de Trabalhos do Rodrigo"
    >
      {/* Header of Section */}
      <div className="flex items-center justify-between px-4 mb-2.5">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#d4af37] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            Clientes Atendidos
          </span>
          <h2 className="text-base font-bold text-zinc-100 font-heading">
            Cortes & Barbas Reais
          </h2>
        </div>
        <span className="text-[11px] text-[#e5c66e] font-semibold bg-[#16161c] px-2.5 py-1 rounded-full border border-zinc-800">
          {currentIndex + 1} de {images.length}
        </span>
      </div>

      {/* Main Slide Card */}
      <div className="relative mx-4 h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#2c2c38] shadow-2xl bg-[#0f0f14]">
        {images.map((item, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive 
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto' 
                  : 'opacity-0 scale-105 z-0 pointer-events-none'
              }`}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover object-center filter brightness-[0.95]"
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-black/20 to-black/25"></div>

              {/* Caption & Badges */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex items-end justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-[#d4af37] bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#d4af37]/40 mb-1.5">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight drop-shadow-md">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-300 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Feito por Rodrigo Barbeiro</span>
                  </p>
                </div>

                {onBookClick && (
                  <button
                    onClick={onBookClick}
                    className="flex-shrink-0 text-xs font-black text-black bg-[#d4af37] hover:bg-[#fae39d] px-3.5 py-2 rounded-xl shadow-lg active:scale-95 transition-all"
                  >
                    Quero Esse
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Foto anterior"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-[#d4af37] hover:bg-black/95 active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Próxima foto"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-[#d4af37] hover:bg-black/95 active:scale-95 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Ir para foto ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-6 bg-[#d4af37]'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
