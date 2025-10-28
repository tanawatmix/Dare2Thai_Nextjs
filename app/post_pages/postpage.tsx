"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar"; // Assuming Navbar has a fixed height (e.g., h-16)
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
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
  FiMapPin, // Import MapPin icon
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { User } from "@supabase/supabase-js"; // Import User
import Hero from "../components/HeroCarousel"; // Assuming HeroCarousel is imported correctly

// --- Type Definition for a Post ---
type Post = {
  id: string;
  image_url: string[];
  title: string;
  place_type: string;
  province: string; // Ensure province is always a string
  description: string;
  user_id: string;
  created_at: string;
  isFav?: boolean;
};

// --- Constant Data ---
const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const filterTags = ["ทั้งหมด", ...placeTypes];
const sortOptions = [
  {
    id: "newest",
    name: "ใหม่สุด",
    icon: <FiClock className="transform scale-x-[-1]" />,
  },
  { id: "oldest", name: "เก่าสุด", icon: <FiClock /> },
  { id: "az", name: "A-Z", icon: <FiArrowDown size={16} /> },
  { id: "za", name: "Z-A", icon: <FiArrowUp size={16} /> },
  { id: "province_az", name: "จังหวัด ก-ฮ", icon: <FiMapPin size={16} /> },
];

// --- Main Page Component ---
const PostPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- States ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [searchName, setSearchName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // --- States and Refs for Sticky Bar ---
  const [isSticky, setIsSticky] = useState(false);
  const stickyContainerRef = useRef<HTMLDivElement>(null); // Ref to the placeholder div
  const filterBarRef = useRef<HTMLDivElement>(null); // Ref to the actual filter bar
  const [filterBarHeight, setFilterBarHeight] = useState(0);
  const [stickyOffsetTop, setStickyOffsetTop] = useState(0); // Store initial top offset

  // --- Assumed Navbar Height ---
  const NAVBAR_HEIGHT = 64; // in pixels

  const postsPerPage = 12;

  // --- Get current user ---
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  // --- Fetch posts ---
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true); // Start loading
      setPosts([]); // Clear old posts immediately
      setFilteredPosts([]);
      try {
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          // Fetch sorted by creation initially, JS sort will handle user selection
          .order("created_at", { ascending: false });
        if (postsError) throw postsError;

        let favIds: string[] = [];
        if (currentUserId) {
          const { data: favData, error: favError } = await supabase
            .from("favorites")
            .select("post_id")
            .eq("user_id", currentUserId);
          if (favError) throw favError;
          favIds = favData?.map((f: any) => f.post_id) || [];
        }

        const safeParseImages = (imgField: any): string[] => {
          if (!imgField) return [];
          if (Array.isArray(imgField)) return imgField;
          try {
            const parsed = JSON.parse(imgField);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [String(imgField)];
          }
        };

        const postsWithFav: Post[] = postsData.map((p: any) => ({
          id: p.id,
          image_url: safeParseImages(p.image_url),
          title: p.title,
          place_type: p.place_type,
          province: p.province || "", // Ensure province is always a string
          description: p.description,
          user_id: p.user_id,
          created_at: p.created_at,
          isFav: favIds.includes(p.id),
        }));

        setPosts(postsWithFav);
      } catch (err: any) {
        toast.error("โหลดโพสต์ล้มเหลว: " + err.message);
      } finally {
        setLoading(false); // Finish loading AFTER data is fetched/error
      }
    };
    fetchPosts();
  }, [currentUserId]);

  // --- Filter & Sort Logic ---
  useEffect(() => {
    if (!loading) {
      let filtered = posts.filter((p) => {
        const matchName = p.title
          .toLowerCase()
          .includes(searchName.toLowerCase());
        const matchType = !selectedType || p.place_type === selectedType;
        return matchName && matchType;
      });

      // Use slice() to create a mutable copy for sorting
      let sorted = filtered.slice();

      switch (sortBy) {
        case "newest":
          sorted.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          break;
        case "oldest":
          sorted.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          break;
        case "az":
          sorted.sort((a, b) => a.title.localeCompare(b.title, "th"));
          break;
        case "za":
          sorted.sort((a, b) => b.title.localeCompare(a.title, "th"));
          break;
        case "province_az":
          sorted.sort((a, b) => a.province.localeCompare(b.province, "th"));
          break;
        default:
          break;
      }
      setFilteredPosts(sorted); // Set the sorted array
    }
  }, [searchName, selectedType, posts, sortBy, loading]);

  // --- Effect for managing Sticky Bar ---
  useEffect(() => {
    if (loading) return;
    const container = stickyContainerRef.current;
    const filterBar = filterBarRef.current;
    if (!container || !filterBar) return;

    const calculateInitialPosition = () => {
      let top = 0;
      let element: HTMLElement | null = container;
      while (element) {
        top += element.offsetTop;
        element = element.offsetParent as HTMLElement | null;
      }
      requestAnimationFrame(() => {
        setStickyOffsetTop(top);
        if (filterBarRef.current) {
          setFilterBarHeight(filterBarRef.current.offsetHeight);
        }
        handleScroll();
      });
    };

    const handleScroll = () => {
      if (
        stickyOffsetTop > 0 &&
        window.scrollY >= stickyOffsetTop - NAVBAR_HEIGHT
      ) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    calculateInitialPosition();
    window.addEventListener("resize", calculateInitialPosition);
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateInitialPosition);
    };
  }, [loading, stickyOffsetTop]);

  // --- Function to handle tag selection and scroll ---
  const handleSelectType = (tag: string) => {
    const newType = tag === "ทั้งหมด" ? "" : tag;
    setSelectedType(newType);
    setCurrentPage(1);
    setTimeout(() => {
      const targetElement = stickyContainerRef.current;
      if (targetElement) {
        const elementTop =
          targetElement.getBoundingClientRect().top + window.scrollY;
        const targetScrollY = Math.max(0, elementTop - NAVBAR_HEIGHT - 10);
        window.scrollTo({ top: targetScrollY, behavior: "smooth" });
      }
    }, 0);
  };

  // --- Function to handle sort change and scroll ---
  const handleSortChange = (sortId: string) => {
    setSortBy(sortId);
    setShowSortMenu(false);
    setCurrentPage(1);
    setTimeout(() => {
      const targetElement = stickyContainerRef.current;
      if (targetElement) {
        const elementTop =
          targetElement.getBoundingClientRect().top + window.scrollY;
        const targetScrollY = Math.max(0, elementTop - NAVBAR_HEIGHT - 10);
        window.scrollTo({ top: targetScrollY, behavior: "smooth" });
      }
    }, 0);
  };

  // --- Pagination ---
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      router.push(`/post_pages?page=${page}`, { scroll: false });
      const targetElement = stickyContainerRef.current;
      if (targetElement) {
        const elementTop =
          targetElement.getBoundingClientRect().top + window.scrollY;
        const targetScrollY = Math.max(0, elementTop - NAVBAR_HEIGHT - 10);
        window.scrollTo({ top: targetScrollY, behavior: "smooth" });
      }
    }
  };

  // --- Favorite ---
  const handleFavPost = async (postId: string) => {
    if (!currentUserId) {
      toast.error("กรุณาล็อกอินเพื่อกดถูกใจโพสต์");
      router.push("/login");
      return;
    }
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;
    const post = posts[postIndex];
    const isFav = post.isFav;
    try {
      if (isFav) {
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
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: currentUserId, post_id: postId });
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
    if (post.user_id !== currentUserId) {
      return toast.error("คุณไม่สามารถลบโพสต์นี้ได้");
    }

    // Use Swal for confirmation
    const result: void | Error = await toast.promise(
      // Define expected type for result
      new Promise<void>((resolve, reject) => {
        import("sweetalert2")
          .then(async (Swal) => {
            const confirmResult = await Swal.default.fire({
              title: "ต้องการลบโพสต์นี้?",
              text: "การกระทำนี้ไม่สามารถย้อนกลับได้!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#3085d6",
              confirmButtonText: "ใช่, ลบเลย!",
              cancelButtonText: "ยกเลิก",
            });
            if (confirmResult.isConfirmed) {
              resolve();
            } else {
              reject(new Error("User cancelled")); // Reject with an error object
            }
          })
          .catch(reject); // Catch dynamic import errors
      }),
      {
        loading: "กำลังลบ...",
        success: "ลบโพสต์สำเร็จ!",
        error: (err) =>
          err.message === "User cancelled"
            ? "ยกเลิกการลบ"
            : "เกิดข้อผิดพลาดในการลบ",
      }
    );

    // ✅ FIX: Remove the unnecessary truthiness check `result &&`
    if (result instanceof Error) {
      console.log("Deletion cancelled or pre-promise error:", result.message);
      return; // Stop execution if user cancelled or another error occurred before deletion attempt
    }
    // Proceed with deletion only if confirmed and no pre-promise error
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) {
        throw error; // Let the catch block handle Supabase errors
      }
      setPosts(posts.filter((p) => p.id !== postId)); // Update state after successful deletion
      // Success toast is handled by toast.promise
    } catch (error: any) {
      toast.error(`ลบโพสต์ไม่สำเร็จ: ${error.message}`);
    }
  };

  // --- Logic การแสดงผล ---
  const isFiltering = searchName !== "" || selectedType !== "";

  return (
    <div
      className={`font-sriracha transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster position="top-right" />
      <Navbar />
      {/* Hero Carousel Section */}
      <div className="max-w-8xl mx-auto px-0 sm:px-0 lg:px-0 pt-[64px] h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden">
        {" "}
        {/* Adjusted padding and max-width */}
        <Hero
          slides={[
            {
              image: "/f2.jpg",
              title: "ภูเก็ต สวรรค์แห่งทะเล",
              subtitle: "เที่ยวทะเล ดำน้ำ ดูพระอาทิตย์ตก",
            },
            {
              image: "/f2.jpg",
              title: "เชียงใหม่ เมืองแห่งวัฒนธรรม",
              subtitle: "สัมผัสธรรมชาติและวิถีชาวเหนือ",
            },
            {
              image: "/f2.jpg",
              title: "กรุงเทพมหานคร",
              subtitle: "ชีวิตเมืองที่ไม่เคยหลับไหล",
            },
          ]}
          autoPlay
          interval={5000}
        />
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
        {" "}
        {/* Adjusted py */}
        {/* --- Controls --- */}
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
            className={`flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all w-full md:w-auto
             ${
               darkMode
                 ? "bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                 : "bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
             }`}
          >
            <FaPlus /> สร้างโพสต์ใหม่
          </motion.button>
          <Link
            href="/Favorites"
            className={`flex items-center gap-2 font-semibold transition-colors
             ${
               darkMode
                 ? "text-pink-400 hover:text-pink-300"
                 : "text-blue-600 hover:text-blue-800"
             }`}
          >
            <FiHeart /> ดูรายการโปรด
          </Link>
        </motion.div>
        {/* --- Filter: ช่องค้นหา --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <FiSearch
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="ค้นหาชื่อโพสต์..."
              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200
                ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 focus:ring-pink-500 focus:border-pink-500 text-white"
                    : "bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
                }
              `}
            />
          </div>
        </motion.div>
        {/* --- Container for Sticky Bar Placeholder --- */}
        <div
          ref={stickyContainerRef}
          style={{ height: isSticky ? `${filterBarHeight}px` : "auto" }}
          className="mb-10"
        >
          <motion.div
            ref={filterBarRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`transition-all duration-300 w-full z-40 ${
              isSticky
                ? `fixed top-16 left-0 right-0 shadow-lg ${
                    darkMode
                      ? "bg-gray-900 border-b border-gray-700"
                      : "bg-gray-50 border-b border-gray-200"
                  }`
                : "relative"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Filter Tags */}
              <div className="flex flex-wrap gap-3">
                {filterTags.map((tag) => {
                  const isActive =
                    (tag === "ทั้งหมด" && !selectedType) ||
                    tag === selectedType;
                  return (
                    <motion.button
                      key={tag}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectType(tag)}
                      className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base
                          ${
                            isActive
                              ? `${
                                  darkMode
                                    ? "bg-pink-500 text-white"
                                    : "bg-blue-500 text-white"
                                } shadow-md`
                              : `${
                                  darkMode
                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                } border border-gray-300 dark:border-gray-600 hover:scale-105`
                          }
                        `}
                    >
                      {tag}
                    </motion.button>
                  );
                })}
              </div>

              {/* Sort Button & Dropdown */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base border hover:scale-105
                      ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }
                    `}
                >
                  <FiFilter size={16} />
                  <span>
                    {sortOptions.find((opt) => opt.id === sortBy)?.name ||
                      "จัดเรียง"}
                  </span>
                </motion.button>
                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl border overflow-hidden z-50 ${
                        darkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleSortChange(opt.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors duration-200
                              ${
                                sortBy === opt.id
                                  ? `${
                                      darkMode
                                        ? "text-pink-400 bg-gray-700"
                                        : "text-blue-500 bg-gray-100"
                                    } font-bold`
                                  : `${
                                      darkMode
                                        ? "text-gray-300 hover:bg-gray-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`
                              }
                            `}
                        >
                          {opt.icon}
                          <span>{opt.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
        {/* --- Posts Grid --- */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <svg
                className={`animate-spin h-10 w-10 ${
                  darkMode ? "text-pink-400" : "text-blue-500"
                }`}
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
                กำลังโหลดโพสต์...
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentPosts.length > 0 ? (
                <motion.div
                  layout
                  className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {currentPosts.map((post) => (
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
                      currentUserId={currentUserId || undefined}
                      ownerId={post.user_id}
                      isFav={post.isFav}
                    />
                  ))}
                </motion.div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                  ไม่พบโพสต์ที่ตรงกับเงื่อนไขการค้นหาของคุณ
                </p>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center items-center gap-2 mt-12 flex-wrap"
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md transition duration-200 border ${
                      darkMode
                        ? "border-gray-600 hover:bg-gray-700 disabled:text-gray-600"
                        : "border-gray-300 hover:bg-gray-100 disabled:text-gray-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <FiChevronsLeft />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md transition duration-200 border ${
                      darkMode
                        ? "border-gray-600 hover:bg-gray-700 disabled:text-gray-600"
                        : "border-gray-300 hover:bg-gray-100 disabled:text-gray-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <FiChevronLeft />
                  </motion.button>
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-md font-semibold transition-all duration-200 border
                                  ${
                                    currentPage === pageNum
                                      ? `${
                                          darkMode
                                            ? "bg-pink-500 text-white border-pink-500"
                                            : "bg-blue-500 text-white border-blue-500"
                                        } shadow-lg`
                                      : `${
                                          darkMode
                                            ? "border-gray-600 hover:bg-gray-700"
                                            : "border-gray-300 hover:bg-gray-100"
                                        } hover:scale-105`
                                  }
                              `}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md transition duration-200 border ${
                      darkMode
                        ? "border-gray-600 hover:bg-gray-700 disabled:text-gray-600"
                        : "border-gray-300 hover:bg-gray-100 disabled:text-gray-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <FiChevronRight />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md transition duration-200 border ${
                      darkMode
                        ? "border-gray-600 hover:bg-gray-700 disabled:text-gray-600"
                        : "border-gray-300 hover:bg-gray-100 disabled:text-gray-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <FiChevronsRight />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default PostPage;
