"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi"; // เพิ่ม FiLoader
import { supabase } from "@/lib/supabaseClient"; // เพิ่ม supabase

// --- 1. Define the Slide type (used by both) ---
type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
};

// --- 2. Define Fetched Slide type ---
type FetchedSlide = {
  image_url: string; // Not null
  title: string | null;
  subtitle: string | null;
};

// --- 3. The Original Display Component (Renamed) ---
type HeroCarouselDisplayProps = {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
};

// ✅ RENAMED: from HeroCarousel to HeroCarouselDisplay
const HeroCarouselDisplay = ({
  slides,
  autoPlay = true,
  interval = 5000,
}: HeroCarouselDisplayProps) => {
  const [current, setCurrent] = useState(0);

  // --- AutoPlay ---
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return; // Don't autoplay if 1 or 0 slides
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  if (slides.length === 0) {
     return <CarouselSkeleton />; // Show skeleton if no slides
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      {/* Slides */}
      {/* ✅ UPDATED: Use key on AnimatePresence and mode="wait" for cleaner transitions */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current} // Key the motion component to the current slide index
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0.5, x: 300 }} // Slide in from right
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0.5, x: -300 }} // Slide out to left
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <img
            src={slides[current].image}
            alt={`Slide ${current + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Overlay สีดำโปร่งแสง */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            {slides[current].title && (
              <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">
                {slides[current].title}
              </h2>
            )}
            {slides[current].subtitle && (
              <p className="text-white/90 text-sm sm:text-lg md:text-xl mt-2 drop-shadow-md">
                {slides[current].subtitle}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Buttons (Only show if more than 1 slide) */}
      {slides.length > 1 && (
        <>
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
        </>
      )}
    </div>
  );
};

// --- 4. Loading Skeleton ---
const CarouselSkeleton = () => (
  <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-700 animate-pulse">
    <div className="absolute inset-0 flex items-center justify-center">
      <FiLoader className="w-12 h-12 text-gray-400 dark:text-gray-500 animate-spin" />
    </div>
  </div>
);

const HeroCarousel = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("hero_slides")
        .select("image_url, title, subtitle")
        .order("created_at", { ascending: false }); // Fetch newest first

      if (error) {
        console.error("Error fetching hero slides:", error);
        // Set fallback slides in case of error
        setSlides([
          { image: "/f1.jpg", title: "เกิดข้อผิดพลาด", subtitle: "ไม่สามารถโหลดสไลด์ได้" }
        ]);
      } else if (data) {
        const formattedSlides = data.map((item: FetchedSlide) => ({
          image: item.image_url,
          title: item.title || undefined, 
          subtitle: item.subtitle || undefined,
        }));
        setSlides(formattedSlides);
      }
      setLoading(false);
    };

    fetchSlides();
  }, []);

  if (loading) {
    return <CarouselSkeleton />;
  }

  // Render the display component with the fetched data
  return <HeroCarouselDisplay slides={slides} autoPlay={true} interval={5000} />;
};

export default HeroCarousel;

