"use client";

import { useContext, useEffect, useRef, useState, MouseEvent, JSX } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeContext } from "./ThemeContext";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import { useTranslation } from "react-i18next";

import D2T2 from "../public/dare2New.png";
import bg1 from "../public/whiteWater.jpg";
import bg2 from "../public/bp.jpg";
import bg3 from "../public/f2.jpg";
import bg4 from "../public/ww.jpg";
import bg5 from "../public/tmc.jpg";

type MousePosition = { x: number; y: number };
type SectionStyle = (bg: { src: string }) => React.CSSProperties;

export default function HomeUI(): JSX.Element {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const { scrollY } = useScroll();
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  // สร้าง Audio object
  const clickSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    clickSound.current = new Audio("/sounds/shoot.wav");
  }, []);

  const handleClick = (): void => {
    if (clickSound.current) {
      clickSound.current.currentTime = 0;
      clickSound.current.play();
    }
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent<Document> | MouseEvent): void => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove as any);
    return () => window.removeEventListener("mousemove", handleMouseMove as any);
  }, []);

  // Fade in/out of sections based on scroll
  // Section 1 fixed opacity (no fade)
  const fadeSection1 = 1;
  const fadeSection2 = useTransform(scrollY, [600, 1100], [0, 1]);
  const fadeSection3 = useTransform(scrollY, [1200, 1800], [0, 1]);

  const sectionStyle: SectionStyle = (bg) => ({
    backgroundImage: `url(${bg.src})`,
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
    backgroundPosition: "center",
  });

  return (
    <div
     className={` ${
      darkMode
        ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white"
        : "bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 text-black"
    } transition-colors duration-700`}
    >
      <div
        style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        backgroundImage: `radial-gradient(circle 200px at ${
          mousePosition.x
        }px ${mousePosition.y}px, ${
          darkMode ? "rgba(254, 163, 253, 0.25)" : "rgba(185, 246, 255, 0.35)"
        }, transparent 60%)`,
        zIndex: 9999,
        transition: "background-image 0.1s ease-out",
      }}
      />

      <Navbar />
      <div
         style={{
          top: 0,
          left: 0,
          width: "99vw",
          height: "100vh",
          backgroundImage: `url(${darkMode ? bg2.src : bg1.src})`,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      >
        {/* HERO */}
        <div className="min-h-screen flex flex-col py-24 items-center justify-center px-4 relative transition duration-700">
          <motion.img
            src={D2T2.src}
            alt="Logo"
            className="w-25 h-25 mt-5 drop-shadow-2xl rounded-full border-8 border-white/40 dark:border-pink-400/30 shadow-xl mb-6"
            animate={{
              rotate: [-2, 2, -2],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              times: [0, 0.2, 0.8, 1],
            }}
          />

          <motion.h1
            className="font-sriracha text-3xl px-10 font-extrabold text-center drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-fuchsia-400 to-orange-300 animate-gradient-anim"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          >
            {t("welcome_message")}
          </motion.h1>

          <motion.div
            className="font-sriracha max-w-xl mt-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 mb-10 border border-pink-200 dark:border-pink-700"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-sm font-bold text-center mb-3 text-pink-600 dark:text-pink-300">
              {t("title")}
            </p>
            <p className="text-sm text-center mb-6 text-gray-700 dark:text-gray-200">
              {t("title2")}
            </p>

            <div className="mx-auto h-20 flex items-center justify-center">
              <motion.button
                className="group flex items-center justify-center gap-2 border-2 border-pink-500 dark:border-blue-400 bg-gradient-to-r from-pink-400 via-orange-300 to-yellow-200 dark:from-blue-900 dark:via-purple-900 dark:to-gray-900 px-8 py-2 text-[14px] font-bold rounded-full shadow-lg hover:scale-105 transition-transform text-white duration-200 relative overflow-hidden hover:shadow-pink-400/40"
                onClick={() => {
                  handleClick();
                  window.location.href = "/post_pages";
                }}
                whileHover={{
                  scale: 1.09,
                  boxShadow: "0 4px 32px rgb(238, 244, 114)",
                }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(255,192,203,0.5)",
                    "0 0 20px rgba(255,192,203,0.8)",
                    "0 0 0px rgba(255,192,203,0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span>{t("go_join")}</span>
                <svg
                  className="w-6 h-6 text-pink-100 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 20 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14m-7-7l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SECTION 1: วัฒนธรรมไทย */}
      <motion.section
        style={{ ...sectionStyle(bg4), opacity: fadeSection1 }}
        className="min-h-screen w-full flex items-center justify-center text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-xl bg-gradient-to-br from-pink-100/90 via-white/90 to-yellow-100/90 dark:from-orange-400/95 dark:via-green-400/90 dark:to-orange-400/95 p-10 md:p-16 rounded-3xl shadow-2xl backdrop-blur-2xl border-2 border-pink-300 dark:border-pink-700 text-black dark:text-white"
          aria-label="วัฒนธรรมไทย"
        >
          <h2 className="text-xl font-extrabold text-pink-500 dark:text-pink-300 mb-8 drop-shadow-lg flex items-center justify-center gap-3">
            <span className="inline-block animate-bounce">🌸</span>
            {t("culture")}
            <span className="inline-block animate-bounce">🌸</span>
          </h2>
          <ul className="text-xs font-medium leading-relaxed mb-6 text-left mx-auto max-w-2xl space-y-3">
            <li>
              <span className="font-bold text-pink-600 dark:text-pink-300">
                •
              </span>{" "}
              {t("travel1")} <span className="text-pink-400">|</span>{" "}
              {t("travel2")} <span className="text-pink-400">|</span>{" "}
              {t("travel3")}
            </li>
            <li>
              <span className="font-bold text-pink-600 dark:text-pink-300">
                •
              </span>{" "}
              {t("travel4")} <span className="text-pink-400">|</span>{" "}
              {t("travel5")} <span className="text-pink-400">|</span>{" "}
              {t("travel6")}
            </li>
            <li>
              <span className="font-bold text-pink-600 dark:text-pink-300">
                •
              </span>{" "}
              {t("travel7")} <span className="text-pink-400">|</span>{" "}
              {t("travel8")} <span className="text-pink-400">|</span>{" "}
              {t("travel9")}
            </li>
          </ul>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="inline-block text-xl animate-pulse">🛕</span>
            <span className="inline-block text-xl animate-pulse">🎎</span>
            <span className="inline-block text-xl animate-pulse">🎨</span>
            <span className="inline-block text-xl animate-pulse">🎉</span>
            <span className="inline-block text-xl animate-pulse">🏮</span>
            <span className="inline-block text-xl animate-pulse">🧧</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-lg">
            <span className="px-3 py-1 rounded-full bg-pink-200/60 dark:bg-pink-900/60 text-pink-700 dark:text-pink-200 font-semibold shadow">
              {t("travel10")}
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-200/60 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-200 font-semibold shadow">
              {t("travel11")}
            </span>
            <span className="px-3 py-1 rounded-full bg-orange-200/60 dark:bg-orange-900/60 text-orange-700 dark:text-orange-200 font-semibold shadow">
              {t("travel12")}
            </span>
          </div>
        </motion.div>
      </motion.section>

      {/* SECTION 2: ธรรมชาติสุดมหัศจรรย์ */}
      <motion.section
        style={{ ...sectionStyle(bg5), opacity: fadeSection2 }}
        className="min-h-screen flex items-center justify-center text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w2xl bg-gradient-to-br from-blue-100/90 via-white/90 to-green-100/90 dark:from-blue-600/95 dark:via-pink-400/90 dark:to-white -900/95 p-10 md:p-16 rounded-3xl shadow-2xl backdrop-blur-2xl border-2 border-blue-300 dark:border-yellow-400 text-black dark:text-white"
          aria-label="ธรรมชาติสุดมหัศจรรย์"
        >
          <h2 className="text-xl font-extrabold text-blue-500 dark:text-yellow-300 mb-8 drop-shadow-lg flex items-center justify-center gap-3">
            <span className="inline-block animate-bounce">🏝️</span>
            {t("pa")}
            <span className="inline-block animate-bounce">🌿</span>
          </h2>
          <ul className="text-xs font-medium leading-relaxed mb-6 text-left mx-auto max-w-2xl space-y-3">
            <li>
              <span className="font-bold text-blue-600 dark:text-yellow-300">
                •
              </span>{" "}
              {t("pa1")} <span className="text-blue-400">|</span> {t("pa2")}{" "}
              <span className="text-blue-400">|</span> {t("pa3")}
            </li>
            <li>
              <span className="font-bold text-blue-600 dark:text-yellow-300">
                •
              </span>{" "}
              {t("pa4")} <span className="text-blue-400">|</span> {t("pa5")}{" "}
              <span className="text-blue-400">|</span> {t("pa6")}
            </li>
            <li>
              <span className="font-bold text-blue-600 dark:text-yellow-300">
                •
              </span>{" "}
              {t("pa7")} <span className="text-blue-400">|</span> {t("pa8")}{" "}
              <span className="text-blue-400">|</span> {t("pa9")}
            </li>
            <li>
              <span className="font-bold text-blue-600 dark:text-yellow-300">
                •
              </span>{" "}
              {t("pa10")}
            </li>
          </ul>

          <div className="flex flex-wrap justify-center gap-4 mt-6 mb-10">
            <span className="inline-block text-xs animate-pulse">🌳</span>
            <span className="inline-block text-xs animate-pulse">🏞️</span>
            <span className="inline-block text-xs animate-pulse">🌊</span>
            <span className="inline-block text-xs animate-pulse">🌾</span>
            <span className="inline-block text-xs animate-pulse">🦜</span>
            <span className="inline-block text-xs animate-pulse">🦋</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-lg">
            <span className="px-3 py-1 rounded-full bg-green-200/60 dark:bg-green-900/60 text-green-700 dark:text-green-200 font-semibold shadow">
              {t("pa11")}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-200/60 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 font-semibold shadow">
              {t("pa12")}
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-200/60 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-200 font-semibold shadow">
              {t("pa13")}
            </span>
          </div>
        </motion.div>
      </motion.section>

      {/* SECTION 3: ช้อป กิน เที่ยว */}
      <motion.section
        style={{ ...sectionStyle(bg3), opacity: fadeSection3 }}
        className="min-h-screen flex items-center justify-center text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="max-w-xl bg-gradient-to-br from-yellow-100/90 via-white/90 to-orange-100/90 dark:from-red-400/95 dark:via-blue-600/90 dark:to-purple-600/95 p-10 md:p-16 rounded-3xl shadow-2xl backdrop-blur-2xl border border-yellow-400"
          aria-label="ช้อป กิน เที่ยว"
        >
          <h2 className="text-2xl font-bold text-yellow-500 dark:text-yellow-300 mb-6 drop-shadow-lg flex items-center justify-center gap-3">
            <span className="inline-block animate-bounce">🛍️</span>
            {t("food")}
            <span className="inline-block animate-bounce">🍜</span>
          </h2>
          <ul className="text-xs text-gray-800 dark:text-white leading-relaxed mb-6 text-left mx-auto max-w-2xl space-y-3">
            <li>
              <span className="font-bold text-yellow-600 dark:text-yellow-300">
                •
              </span>{" "}
              {t("food1")} <span className="text-yellow-400">|</span>{" "}
              {t("food2")} <span className="text-yellow-400">|</span>{" "}
              {t("food3")}
            </li>
            <li>
              <span className="font-bold text-yellow-600 dark:text-yellow-300">
                •
              </span>{" "}
              {t("food4")} <span className="text-yellow-400">|</span>{" "}
              {t("food5")} <span className="text-yellow-400">|</span>{" "}
              {t("food6")}
            </li>
            <li>
              <span className="font-bold text-yellow-600 dark:text-yellow-300">
                •
              </span>{" "}
              {t("food7")} <span className="text-yellow-400">|</span>{" "}
              {t("food8")}
            </li>
          </ul>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="inline-block text-xs animate-pulse">🍲</span>
            <span className="inline-block text-xs animate-pulse">🍢</span>
            <span className="inline-block text-xs animate-pulse">🥢</span>
            <span className="inline-block text-xs animate-pulse">🛒</span>
            <span className="inline-block text-xs animate-pulse">🧺</span>
            <span className="inline-block text-xs animate-pulse">🧁</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-lg">
            <span className="px-3 py-1 rounded-full bg-green-200/60 dark:bg-green-900/60 text-green-700 dark:text-green-200 font-semibold shadow">
              {t("food9")}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-200/60 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 font-semibold shadow">
              {t("food10")}
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-200/60 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-200 font-semibold shadow">
              {t("food11")}
            </span>
          </div>
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
}