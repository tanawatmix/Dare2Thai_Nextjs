"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
};

type HeroCarouselProps = {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
};

const HeroCarousel = ({
  slides,
  autoPlay = true,
  interval = 5000,
}: HeroCarouselProps) => {
  const [current, setCurrent] = useState(0);

  // --- AutoPlay ---
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      {/* Slides */}
      <AnimatePresence>
        {slides.map((slide, index) =>
          index === current ? (
            <motion.div
              key={index}
              className="absolute top-0 left-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay สีดำโปร่งแสง */}
              <div className="absolute inset-0 bg-black/30"></div>

              {/* Text Overlay */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                {slide.title && (
                  <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-white/90 text-sm sm:text-lg md:text-xl mt-2 drop-shadow-md">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-20 transition"
      >
        <FiChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-20 transition"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === i ? "bg-white scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
