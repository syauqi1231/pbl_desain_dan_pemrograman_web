"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroSlide = {
  image: string;
  alt: string;
};

const SLIDE_MS = 6500;

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused || hovered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [slides.length, paused, hovered]);

  if (slides.length === 0) return null;

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={`${slide.image}-${index}`}
          aria-hidden={index !== active}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      {slides.length > 1 ? (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-ivory-50/85 px-1.5 py-1.5 shadow-sm backdrop-blur sm:top-6 sm:right-6">
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Lanjutkan slideshow" : "Jeda slideshow"}
            className="inline-flex size-7 items-center justify-center rounded-full text-espresso-900 transition-colors hover:bg-espresso-900/10"
          >
            {paused ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7Z" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="currentColor"
              >
                <path d="M7 5h3v14H7Zm7 0h3v14h-3Z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-1">
            {slides.map((slide, index) => (
              <button
                key={`dot-${slide.image}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Tampilkan foto ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
                className={`size-2 rounded-full transition-colors ${
                  index === active
                    ? "bg-espresso-900"
                    : "bg-espresso-900/30 hover:bg-espresso-900/55"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
