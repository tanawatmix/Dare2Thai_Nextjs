"use client";

import { useState, useContext, useEffect, useRef} from "react";
import { ThemeContext } from "../ThemeContext";
import { useSearchParams, useRouter } from "next/navigation";
import mockPosts from "../mock/mockPost";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import Drawer from "@mui/material/Drawer";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import wp from "../../public/whiteWater.jpg";
import bp from "../../public/bp.jpg";

const PostPage = () => {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [searchName, setSearchName] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const clickSound = useRef(null);

  useEffect(() => {
    clickSound.current = new Audio("/sounds/shoot.wav");
  }, []);

  const handleClick = () => {
    if (clickSound.current) {
      clickSound.current.currentTime = 0;
      clickSound.current.play();
    } 
  };

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasMounted, setHasMounted] = useState(false);

  // รอ i18n โหลด resource เสร็จ
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

  useEffect(() => {
    setHasMounted(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageParam);

  // ใช้ mockPosts เป็นข้อมูลเริ่มต้น
  const [posts] = useState(mockPosts);
  const [filteredPosts, setFilteredPosts] = useState(posts);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  const postsPerPage = 12;
  const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
  const provinces = [
    "กรุงเทพมหานคร",
    "กระบี่",
    "กาญจนบุรี",
    "เชียงใหม่",
    "อุบลราชธานี",
  ];

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

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const toggleDrawer = (open) => () => setIsDrawerOpen(open);

  const handleSearch = () => {
    toggleDrawer(false)();
  };

  const handlePageChange = (page) => {
    router.push(`?page=${page}`);
  };

  const handleEditPost = (postId) => {
    router.push(`/edit-post/${postId}`);
  };

  // ฟังก์ชันลบโพสต์
  const handleDeletePost = (postId) => {
    if (window.confirm(t("confirm_delete") || "ยืนยันการลบโพสต์นี้?")) {
      setFilteredPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postId)
      );
    }
  };

  const handleLanguageChange = async (lng) => {
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
            <button
            onClick={() => {
                handleClick();
                toggleDrawer(true);
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
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => {
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
                  onChange={(e) => setSelectedType(e.target.value)}
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
                  onChange={(e) => setSelectedProvince(e.target.value)}
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
                  images={post.images}
                  title={post.title}
                  type={post.type}
                  province={post.province}
                  postId={post.id}
                  description={post.description}
                  onClick={() => router.push(`/post_detail/${post.id}`)}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
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
