"use client";

import { JSX, useEffect, useRef, useContext } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import { HTMLMotionProps } from "framer-motion";
import D2T2 from "../public/dare2New.png";

const fadeUp: HTMLMotionProps<"div"> = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
  viewport: { once: true },
};

export default function HomeUI(): JSX.Element {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const clickSound = useRef<HTMLAudioElement | null>(null);

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
          <img
            src={D2T2.src}
            alt="Logo"
            className={`
              w-20 h-20 mx-auto mb-8 rounded-full
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
              window.location.href = "/post_pages";
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
          ${darkMode
            ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent"
            : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"}
        `}
      />

      {/* CULTURE */}
      <section className="py-28 px-6">
        <motion.div
          {...fadeUp}
          className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16"
        >
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {t("culture")}
            </h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {t("travel1")} · {t("travel2")} · {t("travel3")}
            </p>
          </div>

          <div className="grid gap-4">
            {[t("travel4"), t("travel5"), t("travel6"), t("travel7")].map(
              (item, i) => (
                <div
                  key={i}
                  className={`
                    p-4 rounded-xl border transition
                    ${
                      darkMode
                        ? "border-gray-700 hover:border-gray-400"
                        : "border-gray-200 hover:border-gray-900"
                    }
                  `}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </motion.div>
      </section>

      {/* NATURE */}
      <section
        className={`
          py-28 px-6
          ${darkMode ? "bg-gray-900" : "bg-gray-50"}
        `}
      >
        <motion.div
          {...fadeUp}
          className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16"
        >
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {t("pa")}
            </h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {t("pa1")} · {t("pa2")} · {t("pa3")}
            </p>
          </div>

          <div className="grid gap-4">
            {[t("pa4"), t("pa5"), t("pa6"), t("pa7")].map((item, i) => (
              <div
                key={i}
                className={`
                  p-4 rounded-xl border transition
                  ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-gray-200 hover:bg-white"
                  }
                `}
              >
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FOOD */}
      <section className="py-28 px-6">
        <motion.div
          {...fadeUp}
          className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16"
        >
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {t("food")}
            </h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {t("food1")} · {t("food2")} · {t("food3")}
            </p>
          </div>

          <div className="grid gap-4">
            {[t("food4"), t("food5"), t("food6"), t("food7")].map((item, i) => (
              <div
                key={i}
                className={`
                  p-4 rounded-xl border transition
                  ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      : "border-gray-200 hover:bg-gray-900 hover:text-white"
                  }
                `}
              >
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
