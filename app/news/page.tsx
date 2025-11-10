"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { FiPlus, FiArrowUp } from "react-icons/fi";
import { User } from "@supabase/supabase-js";
import toast, { Toaster } from "react-hot-toast";
import NewsCard, { NewsArticle } from "../components/NewsCard";
import { useTranslation } from "react-i18next";
import Masonry from "react-masonry-css";

type Profile = {
  role?: string;
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <svg
      className="animate-spin h-10 w-10 text-blue-500 dark:text-pink-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span className="ml-3 text-lg text-gray-500 dark:text-gray-400">
      กำลังโหลดข่าวสาร...
    </span>
  </div>
);

const NewsListPage: React.FC = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();
        setProfile(profileData ?? null);
      }

      const { data, error } = await supabase
        .from("news")
        .select("id, title, content, image_url, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("ไม่สามารถโหลดข่าวสารได้");
      } else if (data) {
        setNewsList(data as NewsArticle[]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const isAdmin = profile?.role === "admin";

  const breakpointColumnsObj = {
    default: 3,
    1024: 3,
    768: 2,
    500: 1,
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <Toaster position="top-right" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
            {t("News")}
          </h1>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/admin/manage-news")}
              className={`flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg shadow-md transition-all text-sm
                ${
                  darkMode
                    ? "bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                    : "bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
                }`}
            >
              <FiPlus /> {t("AddNews")} (Admin)
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner />
            </motion.div>
          ) : newsList.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">
              {t("NoNewsYet")}
            </p>
          ) : (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-6"
              columnClassName="flex flex-col gap-6"
            >
              {newsList.map((article, index) => {
                const isLarge = index % 4 === 0;

                return (
                  <div
                    key={article.id}
                    className={`${isLarge ? "md:col-span-2" : ""}`}
                  >
                    <NewsCard
                      article={article}
                      darkMode={darkMode}
                      onClick={(id) => router.push(`/news/${id}`)}
                      style={{
                        height: isLarge ? "400px" : "250px",
                      }}
                    />
                  </div>
                );
              })}
            </Masonry>
          )}
        </AnimatePresence>
      </main>
      <Footer />

      <AnimatePresence>
        {isVisible && (
          <motion.button
            key="scroll-to-top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-50 p-3 rounded-full shadow-lg transition-all
              ${
                darkMode
                  ? "bg-pink-500 hover:bg-pink-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            aria-label="Scroll to top"
          >
            <FiArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsListPage;