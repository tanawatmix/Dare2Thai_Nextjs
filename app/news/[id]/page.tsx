"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ThemeContext } from "../../ThemeContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FiEdit, FiCalendar, FiArrowLeft } from "react-icons/fi";
import { User } from "@supabase/supabase-js";

type NewsArticle = {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  author_id?: string;
};

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
      กำลังโหลดเนื้อหา...
    </span>
  </div>
);

const NewsDetailPage: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // User session
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

      if (newsId) {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("id", newsId)
          .single();

        if (error || !data) {
          console.error("Error fetching news article:", error);
          toast.error("ไม่พบข่าวสารนี้ หรือเกิดข้อผิดพลาด");
          router.push("/news");
        } else {
          setArticle(data as NewsArticle);
        }
      } else {
        toast.error("News ID ไม่ถูกต้อง");
        router.push("/news");
      }

      setLoading(false);
    };

    fetchData();
  }, [newsId, router]);

  const isAdmin = profile?.role === "admin";

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"
      }`}
    >
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <Toaster position="top-right" />

        {/* Back button */}
        <motion.button
          onClick={() => router.back()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 mb-6 text-sm font-medium transition-colors ${
            darkMode
              ? " hover:text-pink-400"
              : "hover:text-blue-600"
          }`}
        >
          <FiArrowLeft /> กลับไปหน้ารวมข่าวสาร
        </motion.button>

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
          ) : article ? (
            <motion.div
              key="article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`p-6 sm:p-8 rounded-2xl shadow-lg border transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white  border-gray-200"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                  {article.title}
                </h1>

                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow transition-all whitespace-nowrap ${
                      darkMode
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-yellow-400 hover:bg-yellow-500 text-black"
                    }`}
                    onClick={() =>
                      router.push(`/admin/manage-news?edit=${article.id}`)
                    }
                  >
                    <FiEdit size={14} /> แก้ไขข่าวนี้
                  </motion.button>
                )}
              </div>

              {/* Date */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6 border-b pb-4 dark:border-gray-700">
                <span className="flex items-center gap-1">
                  <FiCalendar /> เผยแพร่: {formatDate(article.created_at)}
                </span>
                {article.created_at !== article.updated_at && (
                  <span>(แก้ไขล่าสุด: {formatDate(article.updated_at)})</span>
                )}
              </div>

              {/* Cover Image */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={article.image_url ?? "/dare2New.png"}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-500 hover:scale-105"
                  priority
                />
              </div>

              {/* Markdown Content */}
              <div
                className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${
                  darkMode ? "prose-invert" : ""
                }`}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-2xl sm:text-3xl font-bold my-4"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-xl sm:text-2xl font-semibold my-3"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-lg sm:text-xl font-semibold my-2"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className="my-3 leading-relaxed"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="ml-5 list-disc my-2" {...props} />
                    ),
                    img: ({ node, ...props }) => (
                      <img
                        className="my-6 rounded-lg max-w-full shadow-md"
                        {...props}
                      />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 pl-4 italic my-4 0"
                        {...props}
                      />
                    ),
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-gray-500"
            >
              ไม่พบข้อมูลข่าวสาร
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetailPage;