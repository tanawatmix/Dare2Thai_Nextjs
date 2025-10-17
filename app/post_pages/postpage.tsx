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
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiHeart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// --- Type Definition for a Post ---
type Post = {
  id: number;
  image_url: string[];
  title: string;
  place_type: string;
  province: string;
  description: string;
  isFav?: boolean;
};

// --- Constant Data ---
const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const provinces = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "เชียงใหม่", "อุบลราชธานี"];

// --- Main Page Component ---
const PostPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- State Management ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [searchName, setSearchName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [loading, setLoading] = useState(true);

  const postsPerPage = 12;

  // --- Data Fetching ---
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("โหลดโพสต์ล้มเหลว: " + error.message);
      } else if (data) {
        const favIds = JSON.parse(localStorage.getItem("favoritePostIds") || "[]");

        // ✅ FIX: สร้างฟังก์ชันแปลงข้อมูลรูปภาพที่ปลอดภัย
        const safeParseImages = (imageUrlField: any): string[] => {
            if (!imageUrlField) return []; // ถ้าเป็น null หรือ undefined ให้คืนค่า array ว่าง
            if (Array.isArray(imageUrlField)) return imageUrlField; // ถ้าเป็น array อยู่แล้ว ให้ใช้เลย
            try {
                const parsed = JSON.parse(imageUrlField);
                return Array.isArray(parsed) ? parsed : []; // ตรวจสอบให้แน่ใจว่าผลลัพธ์เป็น array
            } catch (e) {
                console.error("Failed to parse image_url:", imageUrlField, e);
                return []; // ถ้า parse ไม่สำเร็จ ให้คืนค่า array ว่าง
            }
        };

        const postsWithFav: Post[] = data.map((p: any) => ({
          ...p,
          image_url: safeParseImages(p.image_url), // ใช้ฟังก์ชันแปลงข้อมูลที่ปลอดภัย
          isFav: favIds.includes(p.id),
        }));
        setPosts(postsWithFav);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    const filtered = posts.filter((p) => {
      const matchName = p.title.toLowerCase().includes(searchName.toLowerCase());
      const matchType = selectedType === "" || p.place_type === selectedType;
      const matchProvince = selectedProvince === "" || p.province === selectedProvince;
      return matchName && matchType && matchProvince;
    });
    setFilteredPosts(filtered);
    if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page on filter change, only if not already on it
    }
  }, [searchName, selectedType, selectedProvince, posts]);

  // --- Pagination Logic ---
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

  // --- Post Interaction Handlers ---
  const handleFavPost = (postId: number) => {
    const updatedPosts = posts.map((p) => (p.id === postId ? { ...p, isFav: !p.isFav } : p));
    setPosts(updatedPosts);

    const favIds: number[] = JSON.parse(localStorage.getItem("favoritePostIds") || "[]");
    if (favIds.includes(postId)) {
      localStorage.setItem("favoritePostIds", JSON.stringify(favIds.filter((id) => id !== postId)));
    } else {
      localStorage.setItem("favoritePostIds", JSON.stringify([...favIds, postId]));
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("คุณต้องการลบโพสต์นี้ใช่หรือไม่?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      toast.error("ลบโพสต์ไม่สำเร็จ: " + error.message);
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("ลบโพสต์เรียบร้อยแล้ว");
    }
  };

  return (
    <div className={`font-sriracha transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Toaster position="top-right" />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
        
        {/* --- Control Panel --- */}
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
            <FaPlus />
            สร้างโพสต์ใหม่
          </motion.button>
          <Link href="/Favorites" className="flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors">
             <FiHeart/> ดูรายการโปรด
          </Link>
        </motion.div>

        {/* --- Filter Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 text-black md:grid-cols-3 gap-4 mb-10 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black"/>
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อสถานที่..." 
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">ทุกประเภท</option>
                {placeTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">ทุกจังหวัด</option>
                {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
            </select>
        </motion.div>

        {/* --- Posts Grid --- */}
        <AnimatePresence>
            <motion.div 
              layout
              className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {loading ? (
                <p className="md:col-span-4 text-center">กำลังโหลดโพสต์...</p>
              ) : currentPosts.length > 0 ? (
                currentPosts.map((post) => (
                    // ✅ FIX: ส่ง Props ให้ PostCard อย่างถูกต้องและชัดเจน
                    <PostCard
                        key={post.id}
                        postId={post.id}
                        images={post.image_url}
                        title={post.title}
                        type={post.place_type}
                        province={post.province}
                        description={post.description}
                        isFav={post.isFav}
                        onFav={handleFavPost}
                        onDelete={handleDeletePost}
                    />
                ))
              ) : (
                <p className="md:col-span-4 text-center text-gray-500">ไม่พบโพสต์ที่ตรงกับเงื่อนไขการค้นหาของคุณ</p>
              )}
            </motion.div>
        </AnimatePresence>

        {/* --- Pagination --- */}
        {totalPages > 1 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center items-center gap-2 mt-12"
            >
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><FiChevronsLeft /></button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><FiChevronLeft /></button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-md font-semibold transition-colors ${currentPage === i + 1 ? "bg-blue-500 text-white shadow-lg" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><FiChevronRight /></button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><FiChevronsRight /></button>
            </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PostPage;