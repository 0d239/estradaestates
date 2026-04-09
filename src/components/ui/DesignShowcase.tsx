'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const photos = [
  '/design_loft_1.jpg',
  '/design_loft_2.jpg',
  '/design_loft_4.jpg',
  '/design_barry_3.jpg',
  '/design_barry_4.jpg',
  '/design_barry_1.jpg',
];

const INTERVAL = 4000;

export function DesignShowcase() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);

  const goTo = (next: number) => {
    setFading(true);
    setTimeout(() => {
      setIndex(((next % photos.length) + photos.length) % photos.length);
      setFading(false);
    }, 300);
  };

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      goTo(index + 1);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [index, paused]);

  return (
    <div
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Single photo */}
      <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-neutral-900">
        <img
          src={photos[index]}
          alt={`Design project ${index + 1}`}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-all duration-300',
            fading ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100',
          )}
        />

        {/* Prev / Next arrows */}
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Counter */}
        <span className="absolute bottom-2 right-3 text-[10px] text-white/60 font-medium">
          {index + 1} / {photos.length}
        </span>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === index
                ? 'w-5 bg-primary-500'
                : 'w-1.5 bg-neutral-700 hover:bg-neutral-500',
            )}
            aria-label={`Photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
