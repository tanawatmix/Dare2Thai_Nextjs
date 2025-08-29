"use client";

import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { useRouter } from "next/navigation";
import mockPosts from "../mock/mockPost";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Tilt from "react-parallax-tilt";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

type Post = {
  [x: string]: any;
  id: number;
  images: string[];
  title: string;
  type: string;
  province: string;
  description: string;
  isFav?: boolean;
};

// PostCard component
const PostCard = ({
  post,
  onFav,
}: {
  post: Post;
  onFav?: (id: number) => void;
}) => {
  const router = useRouter();

  const imageSrc =
    post.images && post.images.length > 0
      ? post.images[0]
      : "/default-placeholder.png";

  const handleFav = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onFav) onFav(post.id);
  };

  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      scale={1.02}
      transitionSpeed={400}
    >
      <div className="cursor-pointer rounded-xl overflow-hidden border shadow-md bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
        <Image
          src={imageSrc}
          alt={post.title}
          width={400}
          height={250}
          className="object-cover w-full h-60"
          priority
        />
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {post.description}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>{post.type}</span> • <span>{post.province}</span>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleFav}
              className={`px-3 py-1 rounded-md text-sm flex items-center font-semibold transition ${
                post.isFav
                  ? "bg-yellow-400 text-white shadow-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300"
              }`}
            >
              {post.isFav ? "★ Fav" : "☆ Fav"}
            </button>
          </div>
        </div>
      </div>
    </Tilt>
  );
};

// FavoritesPage component
const FavoritesPage = () => {
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();

  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);

  // โหลดโพสต์ที่ถูกใจจาก localStorage เมื่อ component โหลด
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedFavs = localStorage.getItem("favoritePostIds");
        if (storedFavs) {
          const favIds: number[] = JSON.parse(storedFavs);
          const filteredPosts = mockPosts
            .filter((post) => favIds.includes(post.id))
            .map((post) => ({ ...post, isFav: true }));
          setFavoritePosts(filteredPosts);
        } else {
          setFavoritePosts([]);
        }
      } catch (error) {
        console.error("Failed to load favorite posts from localStorage", error);
        setFavoritePosts([]);
      }
    }
  }, []);

  const handleFavToggle = (postId: number) => {
    // 1. หาโพสต์ที่ต้องการลบออกและเก็บชื่อไว้
    let removedPostTitle = "";
    const postToRemove = favoritePosts.find((p) => p.id === postId);
    if (postToRemove) {
      removedPostTitle = postToRemove.title;
    }

    // 2. อัปเดต state เพื่อลบโพสต์ออกจากรายการ
    setFavoritePosts((prevFavs) => {
      const updatedFavs = prevFavs.filter((p) => p.id !== postId);
      // อัปเดต localStorage ด้วย ID ของโพสต์ที่เหลืออยู่
      if (typeof window !== "undefined") {
        const favIds = updatedFavs.map((p) => p.id);
        localStorage.setItem("favoritePostIds", JSON.stringify(favIds));
      }
      return updatedFavs;
    });

    // 3. แสดง toast หลังจากที่ state ถูกอัปเดตและหน้าจอ re-render
    // การเรียกใช้ toast ในส่วนนี้จะปลอดภัย ไม่ทำให้เกิด error
    if (removedPostTitle) {
      toast.success(`${removedPostTitle} ลบออกจากรายการโปรด`);
    }
  };

  return (
    <div
      className={`min-h-screen transition duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div >
           <h1 className="text-3xl font-bold">รายการโปรดของคุณ</h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-blue-500 cursor-pointer dark:text-pink-400 underline text-sm px-4 py-2 transition"
          >
            ย้อนไปหน้าก่อน
          </button>
        </div>

        {favoritePosts.length === 0 ? (
          <div className="text-center text-gray-500 text-xl">
            ไม่มีโพสต์ที่ถูกใจ
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {favoritePosts.map((post) => (
              <PostCard key={post.id} post={post} onFav={handleFavToggle} />
            ))}
          </div>
        )}
      </div>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default FavoritesPage;
