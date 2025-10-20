"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { FiSearch, FiHeart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Post = {
  id: string;
  image_url: string[];
  title: string;
  place_type: string;
  province: string;
  description: string;
  owner_id: string;
  isFav?: boolean;
};

const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const provinces = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "เชียงใหม่",
  "อุบลราชธานี",
];

const PostPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [searchName, setSearchName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const postsPerPage = 12;

  // --- Get current user ---
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setCurrentUserId(data.user.id);
    };
    getUser();
  }, []);

  // --- Fetch posts ---
  // --- Fetch posts ---
  useEffect(() => {
    const fetchPosts = async () => {
      if (!currentUserId) return;
      setLoading(true);

      try {
        // ดึงโพสต์
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });
        if (postsError) throw postsError;

        // ดึง favorites ของ user ปัจจุบัน
        const { data: favData, error: favError } = await supabase
          .from("favorites")
          .select("post_id")
          .eq("user_id", currentUserId);
        if (favError) throw favError;

        const favIds = favData?.map((f: any) => f.post_id) || [];

        const safeParseImages = (imgField: any): string[] => {
          if (!imgField) return [];
          if (Array.isArray(imgField)) return imgField;
          try {
            return JSON.parse(imgField) || [];
          } catch {
            return [imgField];
          }
        };

        const postsWithFav: Post[] = postsData.map((p: any) => ({
          id: p.id,
          image_url: safeParseImages(p.image_url),
          title: p.title,
          place_type: p.place_type,
          province: p.province,
          description: p.description,
          owner_id: p.user_id,
          isFav: favIds.includes(p.id), // ✅ ใช้จาก Supabase
        }));

        setPosts(postsWithFav);
      } catch (err: any) {
        toast.error("โหลดโพสต์ล้มเหลว: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUserId]); // 🔹 เพิ่ม dependency เพื่อ fetch ใหม่หลังได้ userId

  // --- Filter ---
  useEffect(() => {
    const filtered = posts.filter((p) => {
      const matchName = p.title
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchType = !selectedType || p.place_type === selectedType;
      const matchProvince =
        !selectedProvince || p.province === selectedProvince;
      return matchName && matchType && matchProvince;
    });
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchName, selectedType, selectedProvince, posts]);

  // --- Pagination ---
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      router.push(`/post_pages?page=${page}`, { scroll: false });
    }
  };

  // --- Favorite ---
  const handleFavPost = async (postId: string) => {
    if (!currentUserId) return toast.error("ไม่พบผู้ใช้");

    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const isFav = posts[postIndex].isFav;

    try {
      if (isFav) {
        // ลบ favorite ใน Supabase
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", postId);
        if (error) throw error;

        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isFav: false } : p))
        );
        toast.success("ลบโพสต์ออกจากรายการโปรดแล้ว");
      } else {
        // เพิ่ม favorite
        const { error } = await supabase.from("favorites").insert({
          user_id: currentUserId,
          post_id: postId,
        });
        if (error) throw error;

        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isFav: true } : p))
        );
        toast.success("เพิ่มโพสต์เข้าในรายการโปรดแล้ว");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // --- Delete ---
  const handleDeletePost = async (postId: string) => {
    if (!currentUserId) return toast.error("ไม่พบผู้ใช้");
    const post = posts.find((p) => p.id === postId);
    if (!post) return toast.error("ไม่พบโพสต์");
    if (post.owner_id !== currentUserId)
      return toast.error("คุณไม่สามารถลบโพสต์นี้ได้");

    if (!confirm("คุณต้องการลบโพสต์นี้ใช่หรือไม่?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) toast.error(error.message);
    else setPosts(posts.filter((p) => p.id !== postId));
  };

  return (
    <div
      className={`font-sriracha transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster position="top-right" />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/create_post")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all w-full md:w-auto"
          >
            <FaPlus /> สร้างโพสต์ใหม่
          </motion.button>
          <Link
            href="/Favorites"
            className="flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors"
          >
            <FiHeart /> ดูรายการโปรด
          </Link>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-6 rounded-xl shadow-lg border text-black border-gray-200 dark:border-gray-700"
        >
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสถานที่..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกประเภท</option>
            {placeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกจังหวัด</option>
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Posts Grid */}
        <AnimatePresence>
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {loading ? (
              <p className="md:col-span-4 text-center">กำลังโหลดโพสต์...</p>
            ) : currentPosts.length > 0 ? (
              currentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  title={post.title}
                  description={post.description}
                  type={post.place_type}
                  province={post.province || "-"}
                  images={post.image_url}
                  onDelete={handleDeletePost}
                  onFav={handleFavPost}
                  currentUserId={currentUserId || undefined} // ✅ แปลง null เป็น undefined
                  ownerId={post.owner_id}
                  isFav={post.isFav}
                />
              ))
            ) : (
              <p className="md:col-span-4 text-center text-gray-500">
                ไม่พบโพสต์ที่ตรงกับเงื่อนไขการค้นหาของคุณ
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center gap-2 mt-12"
          >
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"<<"}
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"<"}
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`w-10 h-10 rounded-md font-semibold transition-colors ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white shadow-lg"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {">"}
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {">>"}
            </button>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PostPage;