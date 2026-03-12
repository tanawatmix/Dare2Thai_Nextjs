"use client";

import { JSX, useEffect, useRef, useContext } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import D2T2 from "../public/dare2New.png";
import { useRouter } from "next/navigation";
import Image from "next/image";

const fadeUp: HTMLMotionProps<"div"> = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
  viewport: { once: true },
};

/**
 * A reusable component for displaying a feature section with a title,
 * description, and a grid of items.
 */
type FeatureSectionProps = {
  title: string;
  description: string;
  items: string[];
  darkMode: boolean;
  className?: string;
  itemHoverClasses: { dark: string; light: string };
};

const FeatureSection = ({
  title,
  description,
  items,
  darkMode,
  className,
  itemHoverClasses,
}: FeatureSectionProps) => (
  <section
    className={`
      py-28 px-6
      ${className || ""}
    `}
  >
    <motion.div
      {...fadeUp}
      className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16"
    >
      <div>
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
          {description}
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={`
              p-4 rounded-xl border transition
              ${
                darkMode
                  ? `border-gray-700 ${itemHoverClasses.dark}`
                  : `border-gray-200 ${itemHoverClasses.light}`
              }
            `}
          >
            {item}
          </div>
        ))}
      </div>
    </motion.div>
  </section>
);

export default function HomeUI(): JSX.Element {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    clickSound.current = new Audio("/sounds/shoot.wav");
  }, []);

  return (
    <div
      className={`
        transition-colors duration-300
        ${darkMode ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"}
      `}
    >
      <Navbar />

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <motion.div {...fadeUp} className="max-w-2xl text-center">
          <Image
            src={D2T2}
            alt="Logo"
            width={80}
            height={80}
            className={`
              mx-auto mb-8 rounded-full
              border 
              ${darkMode ? "border-gray-700" : "border-gray-200"}
            `}
          />

          <h1 className="text-4xl font-semibold tracking-tight mb-6">
            {t("welcome_message")}
          </h1>

          <p
            className={`
              text-lg leading-relaxed mb-10
              ${darkMode ? "text-gray-400" : "text-gray-600"}
            `}
          >
            {t("title2")}
          </p>

          <button
            onClick={() => {
              clickSound.current?.play();
              router.push("/post_pages");
            }}
            className={`
              relative overflow-hidden
              px-10 py-3 rounded-full
              text-sm font-medium
              border
              transition
              group
              ${
                darkMode
                  ? "border-gray-600 hover:text-gray-900"
                  : "border-gray-900 hover:text-white"
              }
            `}
          >
            <span className="relative z-10">{t("go_join")}</span>
            <span
              className={`
                absolute inset-0
                translate-y-full
                group-hover:translate-y-0
                transition-transform duration-300
                ${darkMode ? "bg-gray-100" : "bg-gray-900"}
              `}
            />
          </button>
        </motion.div>
      </section>

      {/* Divider */}
      <div
        className={`
          h-px w-full
          ${
            darkMode
              ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          }
        `}
      />

      <FeatureSection
        title={t("culture")}
        description={`${t("travel1")} · ${t("travel2")} · ${t("travel3")}`}
        items={[t("travel4"), t("travel5"), t("travel6"), t("travel7")]}
        darkMode={darkMode}
        itemHoverClasses={{
          dark: "hover:border-gray-400 transition-colors duration-300",
          light: "hover:border-gray-900 transition-colors duration-300",
        }}
      />
      <div
        className={`
          h-px w-full
          ${
            darkMode
              ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          }
        `}
      />
      <FeatureSection
        title={t("pa")}
        description={`${t("pa1")} · ${t("pa2")} · ${t("pa3")}`}
        items={[t("pa4"), t("pa5"), t("pa6"), t("pa7")]}
        darkMode={darkMode}
        itemHoverClasses={{
          dark: "hover:bg-gray-800 hover:scale-105 transition-transform duration-300",
          light: "hover:bg-gray-400 hover:scale-105 transition-transform duration-300",
        }}
      />
      <div
        className={`
          h-px w-full
          ${
            darkMode
              ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          }
        `}
      />
      <FeatureSection
        title={t("food")}
        description={`${t("food1")} · ${t("food2")} · ${t("food3")}`}
        items={[t("food4"), t("food5"), t("food6"), t("food7")]}
        darkMode={darkMode}
        itemHoverClasses={{
          dark: "hover:bg-gray-100 hover:text-gray-900",
          light: "hover:bg-gray-900 hover:text-white",
        }}
      />

      <Footer />
    </div>
  );
}
