"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Tilt from "react-parallax-tilt";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiArrowLeft } from "react-icons/fi";

// --- ✅ FIX 1: แก้ไข Type 'Post' ให้ถูกต้อง ---
type Post = {
  id: string; // id ต้องเป็น string (uuid)
  image_url: string[];
  title: string;
  place_type: string; // ใช้ชื่อให้ตรงกับฐานข้อมูล
  province: string;
  description: string;
  isFav?: boolean;
};

// --- Skeleton Component for Loading State ---
const PostCardSkeleton = () => (
  <div className="rounded-xl border dark:border-gray-700 shadow-md p-4">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    <div className="mt-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
    </div>
  </div>
);

// --- PostCard Component ---
const PostCard = ({
  post,
  onFav,
}: {
  post: Post;
  onFav?: (id: string) => void;
}) => {
  const router = useRouter();
  const imageSrc = post.image_url && post.image_url.length > 0 ? post.image_url[0] : "/default-placeholder.png";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.03} transitionSpeed={500}>
        <div 
          onClick={() => router.push(`/post_detail?id=${post.id}`)}
          className="cursor-pointer rounded-xl overflow-hidden border dark:border-gray-700 shadow-md transition-all duration-300 hover:shadow-2xl group"
        >
          <div className="relative w-full h-48">
            <Image
              src={imageSrc}
              alt={post.title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-bold truncate">{post.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 h-10 overflow-hidden text-ellipsis">{post.description}</p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {/* ✅ FIX 2: เปลี่ยน post.type เป็น post.place_type */}
              <span>{post.place_type}</span> • <span>{post.province}</span>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={(e) => { e.stopPropagation(); onFav?.(post.id); }}
                className={`px-3 py-1 rounded-md text-sm flex items-center font-semibold transition ${
                  post.isFav
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300"
                }`}
              >
                <FiHeart className={`mr-1.5 ${post.isFav ? 'fill-current' : ''}`} /> {post.isFav ? "ถูกใจแล้ว" : "ถูกใจ"}
              </button>
            </div>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
};

// --- Main Favorites Page Component ---
const FavoritesPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const favIds: string[] = JSON.parse(
          localStorage.getItem("favoritePostIds") || "[]"
        );
        if (favIds.length === 0) {
          setFavoritePosts([]); 
          setLoading(false); 
          return;
        }

        const { data, error } = await supabase.from("posts").select("*").in("id", favIds);
        if (error) throw error;

        const safeParseImages = (imageUrlField: any): string[] => {
            if (!imageUrlField) return [];
            if (Array.isArray(imageUrlField)) return imageUrlField;
            try { return JSON.parse(imageUrlField) } catch (e) { return [] }
        };

        const posts: Post[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          place_type: p.place_type,
          province: p.province,
          description: p.description,
          image_url: safeParseImages(p.image_url),
          isFav: true,
        }));

        setFavoritePosts(posts);
      } catch (err: any) {
        toast.error("โหลดรายการโปรดล้มเหลว: " + err.message);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  const handleFavToggle = (postId: string) => {
    const postToRemove = favoritePosts.find((p) => p.id === postId);
    if (postToRemove) toast.success(`"${postToRemove.title}" ถูกลบออกจากรายการโปรด`);

    const updatedFavorites = favoritePosts.filter((p) => p.id !== postId);
    setFavoritePosts(updatedFavorites);

    localStorage.setItem(
      "favoritePostIds",
      JSON.stringify(updatedFavorites.map((p) => p.id))
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className={`font-sriracha transition-colors duration-300 min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
            รายการโปรดของคุณ
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2  border rounded-lg font-semibold  dark:hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft />
            ย้อนกลับ
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
            {Array.from({ length: 4 }).map((_, index) => <PostCardSkeleton key={index} />)}
          </div>
        ) : favoritePosts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center text-gray-500 mt-16 flex flex-col items-center">
            <FiHeart className="w-16 h-16 text-pink-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">ยังไม่มีรายการโปรด</h2>
            <p className="max-w-md mb-6">คุณยังไม่ได้กดถูกใจโพสต์ไหนเลย ลองกลับไปค้นหาสถานที่ที่น่าสนใจแล้วกดรูปหัวใจดูสิ!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/post_pages')}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            >
              กลับไปดูโพสต์ทั้งหมด
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6"
          >
            <AnimatePresence>
              {favoritePosts.map((post) => (
                <PostCard key={post.id} post={post} onFav={handleFavToggle} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default FavoritesPage;