"use client";

import { JSX, useContext } from "react";
import { motion, HTMLMotionProps, useReducedMotion } from "framer-motion";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import D2T2 from "../public/dare2New.png";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiCompass, FiMapPin, FiCoffee } from "react-icons/fi";

const fadeUp: HTMLMotionProps<"div"> = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" },
  viewport: { once: true, margin: "-40px" },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

type FeatureSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  image: string;
  imageAlt: string;
  icon: JSX.Element;
  darkMode: boolean;
  reversed?: boolean;
  accent: "blue" | "emerald" | "amber";
};

const accentStyles = {
  blue: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-300 ring-blue-500/20",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
};

const FeatureSection = ({
  eyebrow,
  title,
  description,
  items,
  image,
  imageAlt,
  icon,
  darkMode,
  reversed,
  accent,
}: FeatureSectionProps) => {
  const styles = accentStyles[accent];

  return (
    <section className="py-20 sm:py-28 px-6">
      <motion.div
        {...fadeUp}
        className={`max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="space-y-6">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ring-1 ${styles.badge}`}
          >
            {icon}
            {eyebrow}
          </span>
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              {title}
            </h2>
            <p
              className={`text-base sm:text-lg leading-relaxed ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {description}
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: reversed ? 12 : -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed transition-colors ${
                  darkMode
                    ? "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/70"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          className="relative"
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -inset-4 rounded-3xl blur-2xl opacity-40 ${
              accent === "blue"
                ? "bg-blue-500/20"
                : accent === "emerald"
                  ? "bg-emerald-500/20"
                  : "bg-amber-500/20"
            }`}
          />
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`relative overflow-hidden rounded-2xl border shadow-xl ${
              darkMode ? "border-gray-800 shadow-black/40" : "border-gray-200 shadow-gray-200/80"
            }`}
          >
            <motion.div
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Image
                src={image}
                alt={imageAlt}
                width={720}
                height={480}
                className="aspect-[4/3] w-full object-cover"
              />
            </motion.div>
            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                darkMode ? "from-gray-950/80 via-transparent" : "from-black/30 via-transparent"
              } to-transparent`}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default function HomeUI(): JSX.Element {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const surface = darkMode
    ? "bg-gray-950 text-gray-100"
    : "bg-gray-50 text-gray-900";

  const muted = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${surface}`}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28 px-6">
        <div
          className={`pointer-events-none absolute inset-0 ${
            darkMode
              ? "bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08),_transparent_50%)]"
              : "bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.06),_transparent_50%)]"
          }`}
        />
        {!prefersReducedMotion && (
          <>
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute top-24 left-[10%] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="pointer-events-none absolute bottom-16 right-[12%] h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl"
            />
          </>
        )}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
            darkMode ? "via-gray-700" : "via-gray-300"
          } to-transparent`}
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative max-w-4xl mx-auto text-center"
        >
          <motion.div variants={staggerItem} className="flex justify-center mb-8">
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={D2T2}
                alt="Dare2Thai logo"
                width={96}
                height={96}
                priority
                className={`rounded-2xl border shadow-lg ${
                  darkMode
                    ? "border-gray-800 shadow-black/30"
                    : "border-white shadow-gray-300/60"
                }`}
              />
            </motion.div>
          </motion.div>

          <motion.p
            variants={staggerItem}
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide mb-6 ${
              darkMode
                ? "border-gray-800 bg-gray-900/60 text-gray-300"
                : "border-gray-200 bg-white text-gray-600 shadow-sm"
            }`}
          >
            {t("title3")}
          </motion.p>

          <motion.h1
            variants={staggerItem}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6"
          >
            {t("welcome_message")}
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className={`text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10 ${muted}`}
          >
            {t("title2")}
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/post_pages")}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-colors ${
                darkMode
                  ? "bg-white text-gray-950 hover:bg-gray-100 shadow-lg shadow-black/20"
                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/15"
              }`}
            >
              {t("go_join")}
              <motion.span
                animate={prefersReducedMotion ? undefined : { x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FiArrowRight className="text-base" />
              </motion.span>
            </motion.button>
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/news"
                className={`inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold border transition-colors ${
                  darkMode
                    ? "border-gray-700 text-gray-200 hover:bg-gray-900"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                {t("News")}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Highlights */}
      <section className="px-6 pb-8">
        <motion.div
          {...fadeUp}
          className={`max-w-6xl mx-auto grid sm:grid-cols-3 gap-4 rounded-2xl border p-6 sm:p-8 ${
            darkMode
              ? "border-gray-800 bg-gray-900/40"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          {[
            { label: t("culture"), value: t("travel1") },
            { label: t("pa"), value: t("pa1") },
            { label: t("food"), value: t("food1") },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`text-center sm:text-left rounded-xl p-3 transition-colors ${
                darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${muted}`}>
                {item.label}
              </p>
              <p className="text-sm sm:text-base font-medium">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div
        className={`h-px max-w-6xl mx-auto ${
          darkMode
            ? "bg-gradient-to-r from-transparent via-gray-800 to-transparent"
            : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
        }`}
      />

      <FeatureSection
        eyebrow={t("culture")}
        title={t("culture")}
        description={`${t("travel1")} · ${t("travel2")} · ${t("travel3")}`}
        items={[t("travel4"), t("travel5"), t("travel6"), t("travel7")]}
        image="/tmc.jpg"
        imageAlt={t("culture")}
        icon={<FiCompass className="text-sm" />}
        darkMode={darkMode}
        accent="blue"
      />

      <div
        className={`h-px max-w-6xl mx-auto ${
          darkMode
            ? "bg-gradient-to-r from-transparent via-gray-800 to-transparent"
            : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
        }`}
      />

      <FeatureSection
        eyebrow={t("pa")}
        title={t("pa")}
        description={`${t("pa1")} · ${t("pa2")} · ${t("pa3")}`}
        items={[t("pa4"), t("pa5"), t("pa6"), t("pa7")]}
        image="/ww.jpg"
        imageAlt={t("pa")}
        icon={<FiMapPin className="text-sm" />}
        darkMode={darkMode}
        reversed
        accent="emerald"
      />

      <div
        className={`h-px max-w-6xl mx-auto ${
          darkMode
            ? "bg-gradient-to-r from-transparent via-gray-800 to-transparent"
            : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
        }`}
      />

      <FeatureSection
        eyebrow={t("food")}
        title={t("food")}
        description={`${t("food1")} · ${t("food2")} · ${t("food3")}`}
        items={[t("food4"), t("food5"), t("food6"), t("food7")]}
        image="/food.jpg"
        imageAlt={t("food")}
        icon={<FiCoffee className="text-sm" />}
        darkMode={darkMode}
        accent="amber"
      />

      {/* CTA */}
      <section className="px-6 py-20 sm:py-24">
        <motion.div
          {...fadeUp}
          className={`max-w-6xl mx-auto rounded-3xl border px-8 py-12 sm:px-12 sm:py-14 text-center ${
            darkMode
              ? "border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950"
              : "border-gray-200 bg-gradient-to-br from-white to-gray-100 shadow-sm"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            {t("Letsgo")}
          </h2>
          <p className={`max-w-xl mx-auto mb-8 ${muted}`}>{t("title")}</p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/post_pages")}
            className={`inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-colors ${
              darkMode
                ? "bg-blue-500 text-white hover:bg-blue-400"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {t("go_join")}
            <FiArrowRight />
          </motion.button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
