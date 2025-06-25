"use client";

import { useContext, useState, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import Navbar from "./components/navbar";

import "./i18n";
import { t } from "i18next";
import Footer from "./components/Footer";
import { ThemeContext } from "./ThemeContext";

import D2T2 from "../public/dare2New.png";
import bp from "../public/bp.jpg";
import wp from "../public/whiteWater.jpg";

const HomeUI = () => {
  const { darkMode } = useContext(ThemeContext);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imgIndex, setImgIndex] = useState(0);
  const dragX = useMotionValue(0);

  // Removed unused SPRING_OPTIONS

  const image = [
    "https://www.ananda.co.th/blog/thegenc/wp-content/uploads/2024/03/ดีไซน์ที่ยังไม่ได้ตั้งชื่อ-2024-05-23T123322.980.png",
    "https://www.scb.co.th/content/media/personal-banking/stories-tips/traveling-thailand/traveling-thailand5.jpg",
    "https://content.skyscnr.com/m/101c2e3b26827c4d/original/GettyImages-472699356.jpg?resize=1800px:1800px&quality=100",
    "https://static.thairath.co.th/media/B6FtNKtgSqRqbnNsUjIbmiEcqGTAplE6rsu5LmPq0IP7vZS8ASy5qvnYYde7wSEWD1QkN.jpg",
    "https://tonkit360.com/wp-content/uploads/2021/10/เที่ยวไทย1-1024x683.jpg",
    "https://www.chillpainai.com/src/wewakeup/scoop/images/1acefd76e1d13a2933acc46dbbe611b9a0cd3b65.jpg",
    "https://www.kkday.com/th/blog/wp-content/uploads/colton-duke-pit2V7NJ_e4-unsplash.jpg",
    "https://www.chillpainai.com/src/wewakeup/scoop/images/d8d6d962a509bce12dbf32dcf9fa5aac716eaa05.jpg",
    "https://f.ptcdn.info/769/044/000/ob1ahrm9zPblJUdIXnV-o.jpg",
  ];

  const setImgIndexSafe = (callbackOrValue) => {
    setImgIndex((prev) => {
      const next =
        typeof callbackOrValue === "function"
          ? callbackOrValue(prev)
          : callbackOrValue;
      return (next + image.length) % image.length;
    });
  };

  const onDragEnd = (_, info) => {
    if (info.offset.x < -100 && imgIndex < image.length - 1) {
      setImgIndex((prev) => prev + 1);
    } else if (info.offset.x > 100 && imgIndex > 0) {
      setImgIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % image.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [image.length]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`relative min-h-screen transition duration-500 overflow-x-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
      style={{
        backgroundImage: `radial-gradient(circle 300px at ${
          mousePosition.x
        }px ${mousePosition.y}px, ${
          darkMode ? "rgba(254, 163, 253, 0.5)" : "rgba(185, 246, 255, 0.5)"
        }, transparent 50%), url(${darkMode ? bp.src : wp.src})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <Navbar />

      <div className="relative z-10">
        <div className="flex flex-col items-center justify-center mt-20 min-h-screen px-4">
          <motion.img
            src={D2T2.src}
            alt="D2T"
            className="w-64 h-64 drop-shadow-2xl"
            animate={{
              rotate: [-2, 2, -2],
              opacity: [0, 1, 1, 0], // fade in → visible → fade out
            }}
            transition={{
              duration: 6, // รวมเวลา fade in + rotate + fade out
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              times: [0, 0.2, 0.8, 1], // เวลาสำหรับแต่ละค่าใน opacity
            }}
          />

          <motion.h1
            className={`font-sriracha text-6xl py-4 px-20 font-extrabold mb-4 text-center drop-shadow-lg transition duration-500 bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-anim ${
              darkMode
                ? "from-blue-500 via-purple-300 to-pink-400"
                : "from-pink-500 via-pink-400 to-orange-300"
            }`}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          >
            {t("welcome_message")}
          </motion.h1>
          <motion.div
            className="font-sriracha max-w-3xl backdrop-blur-sm rounded-xl shadow-xl p-3 mb-8 transition duration-500"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-xl font-bold text-center mb-4">{t("title")}</p>
            <p className="text-base text-center mb-4">{t("title2")}</p>

            <div className="mx-auto h-20 w-full max-w-72 flex items-center justify-center">
              <motion.button
                className="group flex h-12 w-56 items-center justify-center animate-gradient-anims gap-3 border-2 border-pink-500 dark:border-blue-400 bg-gradient-to-r from-pink-100 via-orange-100 to-white dark:from-blue-900 dark:via-purple-900 dark:to-gray-900 px-8 text-lg font-semibold rounded-full shadow-md hover:scale-105 transition-transform duration-200 relative overflow-hidden"
                onClick={() => (window.location.href = "/post_pages")}
                whileHover={{
                  scale: 1.08,
                  boxShadow: "0 4px 32px rgb(238, 244, 114) ",
                }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(255,192,203,0.5)",
                    "0 0 20px rgba(255,192,203,0.8)",
                    "0 0 0px rgba(255,192,203,0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <span className="relative overflow-hidden">
                  <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full dark:text-white">
                    {t("go_join")}
                  </span>
                  <span className="absolute left-0 top-0 block translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    {t("Letsgo")}
                  </span>
                </span>
                <svg
                  className="w-5 h-5 ml-2 text-pink-500 dark:text-blue-400 transition-transform duration-300 group-hover:translate-x-1"
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
          {/* Carousel */}
          <div className="relative w-full max-w-3xl flex items-center justify-center mt-8 mb-4">
            <div className="overflow-hidden rounded-xl w-full shadow-2xl border-4 border-pink-200 dark:border-blue-400">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                style={{ x: dragX }}
                animate={{ x: -imgIndex * 100 + "%" }}
                // transition={SPRING_OPTIONS}
                onDragEnd={onDragEnd}
                className="flex"
              >
                {image.map((src, idx) => (
                  <motion.img
                    key={idx}
                    src={src}
                    alt={`carousel-img-${idx}`}
                    className={`object-cover object-center mx-auto w-full h-80 flex-shrink-0 transition-all duration-500 ${
                      idx === imgIndex
                        ? "shadow-2xl scale-105 brightness-110"
                        : "brightness-75"
                    }`}
                    style={{ minWidth: "100%" }}
                    initial={{ opacity: 0.7, scale: 0.95 }}
                    animate={{
                      opacity: idx === imgIndex ? 1 : 0.7,
                      scale: idx === imgIndex ? 1.05 : 0.95,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
          <div className="flex bg-blue-200 rounded-full justify-center mt-4">
            {image.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setImgIndexSafe(idx)}
                className={`h-3 w-6 hover:scale-150 mx-1 rounded-full hover:border-2 border-white-500 transition-all duration-100 ${
                  idx === imgIndex
                    ? darkMode
                      ? "bg-black scale-150 shadow-lg"
                      : "bg-pink-500 scale-150 shadow-lg"
                    : " hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                whileHover={{ scale: 1.4 }}
              />
            ))}
          </div>
          <motion.div
            className="max-w-4xl backdrop-blur-sm rounded-xl shadow-xl p-4 mt-16 mb-20 transition duration-500"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h2
              className={`font-sriracha text-2xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-anim ${
                darkMode
                  ? "from-blue-500 via-purple-300 to-pink-400"
                  : "from-pink-500 via-pink-400 to-orange-300"
              }`}
            >
              {t("title3")}
            </h2>
            <p className="font-sriracha text-base text-center">{t("title4")}</p>
            <div className="max-w-3xl mx-auto my-8 relative aspect-video rounded-xl overflow-hidden shadow-lg border-4 border-pink-200 dark:border-blue-400">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/Y2KLfYr-UiQ?autoplay=1&mute=1"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 3 }}
                style={{
                  background:
                    "radial-gradient(circle at 80% 20%, rgba(236,72,153,0.15), transparent 70%)",
                }}
              />
            </div>
            <p className="font-sriracha text-base text-center">
              🔺🔺🔺🔺----------------------------------🔺🔺🔺🔺
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default HomeUI;
