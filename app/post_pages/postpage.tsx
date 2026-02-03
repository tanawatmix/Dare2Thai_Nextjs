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
import { useTranslation } from "react-i18next";
import {
  FiSearch,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiClock,
  FiArrowDown,
  FiArrowUp,
  FiFilter,
  FiMapPin,
  FiThumbsUp,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Hero from "../components/HeroCarousel";

type Post = {
  id: string;
  image_url: string[];
  title: string;
  place_type: string;
  province: string;
  description: string;
  user_id: string;
  created_at: string;
  isFav?: boolean; // สำหรับ Favorites
  like_count: number;
  isLiked?: boolean; // สำหรับ Likes
};

const postsPerPage = 12;

export default function PostPage() {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Sync page from URL
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) setCurrentPage(parseInt(pageParam));
  }, [searchParams]);

  const placeTypes = [
    t("restaurant"),
    t("tourist_place"),
    t("hotel"),
    t("cafe"),
    t("souvenir_shop"),
    t("temple"),
    t("club"),
    t("market"),
  ];
  const filterTags = [t("all"), ...placeTypes];

  const sortOptions = [
    { id: "newest", name: t("sort_newest"), icon: <FiClock /> },
    { id: "oldest", name: t("sort_oldest"), icon: <FiClock /> },
    { id: "az", name: t("sort_az"), icon: <FiArrowDown /> },
    { id: "za", name: t("sort_za"), icon: <FiArrowUp /> },
    { id: "province_az", name: t("sort_province"), icon: <FiMapPin /> },
    { id: "most_liked", name: t("sort_most_liked"), icon: <FiThumbsUp /> },
  ];

  /* -------------------- USER -------------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  /* -------------------- FETCH POSTS -------------------- */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // 1. Get User
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // 2. Get Posts
      const { data: postsData, error: postError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postError) throw postError;

      // 3. Get Likes (Counts & User Status)
      const { data: likesData } = await supabase.from("post_likes").select("post_id, user_id");
      
      // Calculate Likes
      const likeCounts = new Map<string, number>();
      const userLikedSet = new Set<string>();

      likesData?.forEach((like) => {
        // Count
        likeCounts.set(like.post_id, (likeCounts.get(like.post_id) || 0) + 1);
        // Check if current user liked
        if (userId && like.user_id === userId) {
          userLikedSet.add(like.post_id);
        }
      });

      // 4. Merge Data
      const formattedPosts: Post[] = (postsData || []).map((p: any) => ({
        ...p,
        image_url: Array.isArray(p.image_url) ? p.image_url : JSON.parse(p.image_url || "[]"),
        like_count: likeCounts.get(p.id) || 0,
        isLiked: userLikedSet.has(p.id),
      }));

      setPosts(formattedPosts);
    } catch (e: any) {
      console.error(e);
      toast.error("Error loading posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* -------------------- HANDLERS -------------------- */
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
        const { error } = await supabase.from("posts").delete().eq("id", postId);
        if (error) throw error;
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        toast.success("Post deleted successfully");
    } catch (error) {
        console.error(error);
        toast.error("Failed to delete post");
    }
  };

  const handleLikePost = async (postId: string, currentLikeStatus: boolean) => {
      if (!currentUserId) return toast.error("Please login to like");

      // Optimistic Update (อัปเดตหน้าจอทันทีไม่ต้องรอเซิร์ฟเวอร์)
      setPosts(prev => prev.map(p => {
          if (p.id === postId) {
              return {
                  ...p,
                  isLiked: !p.isLiked,
                  like_count: p.isLiked ? p.like_count - 1 : p.like_count + 1
              }
          }
          return p;
      }));

      try {
          if (currentLikeStatus) {
              // Unlike
              await supabase.from("post_likes").delete().match({ post_id: postId, user_id: currentUserId });
          } else {
              // Like
              await supabase.from("post_likes").insert({ post_id: postId, user_id: currentUserId });
          }
      } catch (error) {
          // Revert if error
          fetchPosts(); 
          toast.error("Something went wrong");
      }
  }

  /* -------------------- FILTER & SORT -------------------- */
  useEffect(() => {
    let list = posts.filter((p) => {
      const nameMatch = p.title.toLowerCase().includes(searchName.toLowerCase());
      const typeMatch = !selectedType || selectedType === t("all") ? true : p.place_type === selectedType;
      return nameMatch && typeMatch;
    });

    switch (sortBy) {
      case "most_liked":
        list.sort((a, b) => b.like_count - a.like_count);
        break;
      case "az":
        list.sort((a, b) => a.title.localeCompare(b.title, "th"));
        break;
      case "za":
        list.sort((a, b) => b.title.localeCompare(a.title, "th"));
        break;
      case "oldest":
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "newest":
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredPosts(list);
    // Reset to page 1 when filter changes
    // setCurrentPage(1); 
  }, [posts, searchName, selectedType, sortBy, t]);

  // Pagination Logic
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Toaster />
      <Navbar />

      {/* ---------- HERO ---------- */}
      <div className="relative pt-16"> {/* Add padding-top to account for fixed navbar */}
        <div className="h-[420px] md:h-[520px] overflow-hidden">
          <Hero />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* ACTION BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <button
            onClick={() => router.push("/create_post")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-sm transition transform hover:scale-105
              ${darkMode ? "bg-pink-500 hover:bg-pink-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            <FaPlus /> {t("share_your_journey")}
          </button>

          <Link
            href="/Favorites"
            className={`flex items-center gap-2 text-sm font-medium transition
              ${darkMode ? "text-gray-300 hover:text-pink-400" : "text-gray-600 hover:text-blue-600"}`}
          >
            <FiHeart /> {t("fav")}
          </Link>
        </div>

        {/* SEARCH */}
        <div className="relative mb-8">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder={t("search") || "ค้นหาโพสต์..."}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border backdrop-blur transition outline-none
              ${darkMode ? "bg-gray-800/70 border-gray-700 focus:ring-2 focus:ring-pink-500" : "bg-white/80 border-gray-200 focus:ring-2 focus:ring-blue-500"}`}
          />
        </div>

        {/* STICKY FILTER BAR (CSS Sticky) */}
        <div className={`sticky top-16 z-40 py-2 mb-6 transition-colors ${darkMode ? "bg-gray-900/95" : "bg-gray-50/95"} backdrop-blur-sm`}>
          <div className="flex flex-wrap gap-3 justify-between items-center">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {filterTags.map((tag) => {
                const active = (tag === t("all") && !selectedType) || tag === selectedType;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedType(tag === t("all") ? "" : tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition
                      ${active 
                        ? (darkMode ? "bg-pink-500 text-white" : "bg-blue-500 text-white") 
                        : (darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-600 hover:bg-gray-200 shadow-sm")
                      }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border font-medium shadow-sm transition
                  ${darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}
              >
                <FiFilter />
                {sortOptions.find((o) => o.id === sortBy)?.name ?? t("sort_newest")}
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg overflow-hidden border z-50
                      ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                  >
                    {sortOptions.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSortBy(o.id);
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2
                           ${darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-50 text-gray-700"}`}
                      >
                        {o.icon} {o.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* POSTS GRID */}
        <AnimatePresence>
            {loading ? (
            <p className="text-center py-20 text-gray-400 animate-pulse">กำลังโหลดข้อมูล...</p>
            ) : (
            <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[50vh]">
                {currentPosts.map((post) => (
                    <PostCard
                        key={post.id}
                        postId={post.id}
                        title={post.title}
                        description={post.description}
                        images={post.image_url} // ส่ง image_url array
                        type={post.place_type}
                        province={post.province}
                        likeCount={post.like_count}
                        isLiked={post.isLiked}
                        ownerId={post.user_id}
                        currentUserId={currentUserId}
                        onDelete={() => handleDeletePost(post.id)}
                        onLike={() => handleLikePost(post.id, post.isLiked || false)}
                    />
                ))}
                </div>
                
                {currentPosts.length === 0 && (
                    <div className="text-center py-20 opacity-60">
                        <p className="text-xl">ไม่พบโพสต์ที่คุณค้นหา</p>
                    </div>
                )}
            </>
            )}
        </AnimatePresence>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
                className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <FiChevronsLeft />
            </button>
            <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <FiChevronLeft />
            </button>
            
            <span className="px-4 py-2 font-medium">
                {currentPage} / {totalPages}
            </span>

            <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <FiChevronRight />
            </button>
            <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <FiChevronsRight />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}