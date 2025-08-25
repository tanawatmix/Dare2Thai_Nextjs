"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { ThemeContext } from "../ThemeContext";
import Image from "next/image";
import wp from "../../public/whiteWater.jpg";
import bp from "../../public/bp.jpg";
import { useTranslation } from "react-i18next";
import mockPosts from "../mock/mockPost";
import { motion } from "framer-motion";

const PostDetailsUI = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const postId = searchParams.get("id");

  const [post, setPost] = useState(null);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("mockPosts", JSON.stringify(mockPosts));
  }, []);

  useEffect(() => {
    if (!postId) {
      setPost(null);
      return;
    }

    try {
      const allPosts = JSON.parse(localStorage.getItem("mockPosts") || "[]");
      const foundPost = allPosts.find((p) => String(p.id) === String(postId));
      setPost(foundPost || null);
    } catch (error) {
      setPost(null);
    }
  }, [postId]);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold bg-gradient-to-br from-blue-100 text-black to-pink-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400 border-opacity-50 mb-4"></div>
        <span className="ml-4">{t("loading") || "กำลังโหลด..."}</span>
      </div>
    );
  }

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center text-lg font-semibold bg-gradient-to-br from-blue-100 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4"
      >
        <p className="mb-6">{t("not_found") || "ไม่พบโพสต์"}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="px-6 py-3 border border-blue-400 dark:border-pink-400 rounded-lg font-semibold shadow bg-white dark:bg-black hover:bg-blue-50 dark:hover:bg-gray-900 dark:text-white transition"
        >
          {t("back") || "ย้อนกลับ"}
        </motion.button>
      </motion.div>
    );
  }

  const { title, images, type, province, description } = post;

  return (
    <div className="font-sriracha flex flex-col min-h-screen">
      <Navbar />
      <div
        className="relative bg-fixed bg-center bg-cover transition duration-500 flex-1"
        style={{
          backgroundImage: `url(${darkMode ? bp.src : wp.src})`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto 80 border border-blue-400 dark:border-pink-400 p-10 rounded-3xl mt-20 mb-8 shadow-2xl backdrop-blur-lg"
        >
          {/* Images */}
          {images && images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {images.map((image, index) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  key={index}
                  className="aspect-square flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-blue-300 dark:border-pink-300 shadow-md transition-transform"
                >
                  <Image
                    src={image}
                    alt={`รูป ${index + 1}`}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    priority={index === 0}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white text-center">
            {title}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium dark:bg-blue-900 dark:text-blue-200 shadow">
              {type}
            </span>
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium dark:bg-green-900 dark:text-green-200 shadow">
              {province}
            </span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 mb-8 leading-relaxed whitespace-pre-line text-left">
            {description}
          </p>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                router.push(
                  `/chat?id=${postId}&title=${encodeURIComponent(title)}`
                )
              }
              className="w-full py-3 border border-blue-400 dark:border-pink-400 rounded-lg bg-blue-100 dark:bg-pink-900 text-blue-900 dark:text-pink-100 font-semibold shadow hover:bg-blue-200 dark:hover:bg-pink-800 transition"
            >
              {t("join")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/post_pages")}
              className="w-full py-3 border border-blue-400 dark:border-pink-400 rounded-lg font-semibold shadow bg-white dark:bg-black hover:bg-blue-50 dark:hover:bg-gray-900 dark:text-white transition"
            >
              {t("back")}
            </motion.button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default PostDetailsUI;
