"use client";

import {
  useState,
  useContext,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { ThemeContext } from "../ThemeContext";
import { useSearchParams, useRouter } from "next/navigation";
import mockPosts from "../mock/mockPost";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Tilt from "react-parallax-tilt";
import Image from "next/image";
import Drawer from "@mui/material/Drawer";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import wp from "../../public/whiteWater.jpg";
import bp from "../../public/bp.jpg";
import toast, { Toaster } from "react-hot-toast"; // import Toaster
import Link from "@mui/material/Link";

// Import PostCard ที่แก้ไขแล้ว
import PostCard from "../components/PostCard";

type Post = {
  id: number;
  images: string[];
  title: string;
  type: string;
  province: string;
  description: string;
  isFav?: boolean; // เพิ่ม flag สำหรับ fav
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
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const clickSound = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    clickSound.current = new Audio("/sounds/shoot.wav");
  }, []);

  const handleClick = () => {
    if (clickSound.current) {
      clickSound.current.currentTime = 0;
      clickSound.current.play();
    }
  };

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hasMounted, setHasMounted] = useState(false);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    } else if (typeof i18n.on === "function") {
      const onInitialized = () => setReady(true);
      i18n.on("initialized", onInitialized);
      return () => {
        i18n.off && i18n.off("initialized", onInitialized);
      };
    } else {
      setReady(true);
    }
  }, [i18n]);

  // Use localStorage to set the initial isFav status
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const initializePosts = () => {
      if (typeof window !== "undefined") {
        const storedFavIds = localStorage.getItem("favoritePostIds");
        const favIds: number[] = storedFavIds ? JSON.parse(storedFavIds) : [];
        const initialPosts = mockPosts.map((post) => ({
          ...post,
          isFav: favIds.includes(post.id),
        }));
        setPosts(initialPosts);
      }
    };
    initializePosts();
  }, []);

  useEffect(() => {
    setHasMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);

  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    const filtered = posts.filter((post) => {
      const matchName =
        searchName.trim() === "" ||
        post.title.toLowerCase().includes(searchName.toLowerCase());
      const matchType = selectedType === "" || post.type === selectedType;
      const matchProvince =
        selectedProvince === "" || post.province === selectedProvince;
      return matchName && matchType && matchProvince;
    });
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchName, selectedType, selectedProvince, posts]);

  const postsPerPage = 12;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const toggleDrawer = (open: boolean) => () => setIsDrawerOpen(open);

  const handleSearch = () => {
    toggleDrawer(false)();
  };

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`);
  };

  const handleEditPost = (postId: number) => {
    router.push(`/edit-post/${postId}`);
  };

  const handleDeletePost = (postId: number) => {
    if (window.confirm(t("confirm_delete") || "ยืนยันการลบโพสต์นี้?")) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.error("โพสต์ถูกลบแล้ว");
    }
  };

  // Toggle Fav
  const handleFavPost = (postId: number) => {
    const postToFav = posts.find((p) => p.id === postId);

    if (postToFav) {
      const newFavStatus = !postToFav.isFav;
      const toastMessage = newFavStatus
        ? "เพิ่มในรายการโปรด"
        : "ลบออกจากรายการโปรด";

      // 1. Update state
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isFav: newFavStatus } : p))
      );

      // 2. Update localStorage
      if (typeof window !== "undefined") {
        const storedFavs = localStorage.getItem("favoritePostIds");
        const favIds: number[] = storedFavs ? JSON.parse(storedFavs) : [];

        if (newFavStatus) {
          if (!favIds.includes(postId)) {
            favIds.push(postId);
          }
        } else {
          const index = favIds.indexOf(postId);
          if (index > -1) {
            favIds.splice(index, 1);
          }
        }
        localStorage.setItem("favoritePostIds", JSON.stringify(favIds));
      }

      // 3. Show toast
      toast.success(`${postToFav.title} ${toastMessage}`);
    }
  };

  const handleLanguageChange = async (lng: string) => {
    if (["en", "th"].includes(lng)) {
      await i18n.changeLanguage(lng);
    }
  };

  if (!ready) return <div>Loading translations...</div>;

  return (
    <div
      className={`relative min-h-screen transition duration-500 overflow-x-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
      style={
        hasMounted
          ? {
              backgroundImage: `radial-gradient(circle 300px at ${
                mousePosition.x
              }px ${mousePosition.y}px, ${
                darkMode
                  ? "rgba(254, 163, 253, 0.5)"
                  : "rgba(185, 246, 255, 0.5)"
              }, transparent 50%), url(${darkMode ? bp.src : wp.src})`,
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <Toaster position="top-right" /> {/* Toaster อยู่ที่นี่ที่เดียว */}
      <div className="relative bg-fixed bg-center bg-cover transition duration-500 flex-1">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col mt-5 md:flex-row items-center justify-between gap-4 mb-8">
            <button
              onClick={() => {
                handleClick();
                router.push("/create_post");
              }}
              className="flex items-center gap-2 border-2 border-blue-400 dark:border-pink-500 rounded-lg bg-primary text-black dark:bg-black dark:text-white px-6 py-2 font-semibold shadow hover:bg-black hover:text-white dark:hover:bg-primary dark:hover:text-secondary transition-all duration-300 hover:scale-105"
            >
              <FaPlus />
              <p suppressHydrationWarning>{t("post")}</p>
            </button>
            <Link
              href="/Favorites"
              className="ml-4 text-blue-500 dark:text-pink-400 underline text-sm"
            >
              ดูรายการโปรด
            </Link>
            <button
              onClick={() => {
                handleClick();
                toggleDrawer(true)();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-pink-400 dark:hover:bg-pink-400 transition-all duration-300 shadow"
            >
              <FaSearch className="text-xl" />
              <span className="hidden md:inline" suppressHydrationWarning>
                {t("search")}
              </span>
            </button>
          </div>

          <Drawer
            anchor="right"
            open={isDrawerOpen}
            onClose={toggleDrawer(false)}
          >
            <div className="font-sriracha w-[320px] p-6 space-y-6 bg-primary dark:bg-secondary h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-secondary dark:text-primary mb-4">
                {t("search")}
              </h2>
              <div>
                <label className="block mb-1 text-sm font-medium text-secondary dark:text-primary">
                  {t("PlaceName")}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                  value={searchName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchName(e.target.value)
                  }
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="เช่น วัดพระแก้ว"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-secondary dark:text-primary">
                  {t("Placetag")}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                  value={selectedType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setSelectedType(e.target.value)
                  }
                >
                  <option value="">{t("all") || "ทั้งหมด"}</option>
                  {placeTypes.map((type, i) => (
                    <option key={i} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-secondary dark:text-primary">
                  {t("Provincetag")}
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                  value={selectedProvince}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setSelectedProvince(e.target.value)
                  }
                >
                  <option value="">{t("all") || "ทั้งหมด"}</option>
                  {provinces.map((province, i) => (
                    <option key={i} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="w-full bg-pink-400 hover:bg-secondary dark:hover:bg-primary hover:dark:text-secondary text-white font-semibold text-xl py-2 rounded shadow transition-all duration-300"
              >
                {t("search")}
              </button>
              <button
                onClick={() => {
                  setSearchName("");
                  setSelectedType("");
                  setSelectedProvince("");
                  setCurrentPage(1);
                  setFilteredPosts(posts);
                  toggleDrawer(false)();
                }}
                className="text-sm underline text-pink-400 dark:hover:text-primary hover:text-secondary"
              >
                {t("clear_filters") || "ล้างตัวกรอง"}
              </button>
            </div>
          </Drawer>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {currentPosts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 text-xl">
                {t("no_posts_found") || "ไม่พบโพสต์ที่ตรงกับตัวกรอง"}
              </div>
            ) : (
              currentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  {...post}
                  postId={post.id}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onFav={handleFavPost}
                />
              ))
            )}
          </div>
          <div className="flex justify-center items-center gap-2 mt-8">
            {currentPage > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-2 py-1 rounded border border-blue-400 dark:border-pink-400"
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-2 py-1 rounded border border-blue-400 dark:border-pink-400"
                >
                  {"<"}
                </button>
              </>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(
                1,
                Math.min(currentPage - 2, totalPages - 4)
              );
              const pageNumber = i + startPage;
              if (pageNumber > totalPages) return null;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded border dark:border-pink-400 border-blue-400 hover:bg-blue-400 dark:hover:bg-pink-400 ${
                    currentPage === pageNumber
                      ? "bg-blue-400 dark:bg-pink-400 text-white dark:text-secondary"
                      : "bg-pink dark:bg-secondary"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            {currentPage < totalPages && (
              <>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-2 py-1 rounded border border-blue-400 dark:border-pink-400"
                >
                  {">"}
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-2 py-1 rounded border border-blue-400 dark:border-pink-400"
                >
                  {">>"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostPage;
