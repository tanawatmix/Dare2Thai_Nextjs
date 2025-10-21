"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { ThemeContext } from "../ThemeContext";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import dynamic from 'next/dynamic'; // ✅ 1. Import dynamic

// --- Lightbox Components ---
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// --- Icons ---
import {
  FiArrowLeft,
  FiMessageSquare,
  FiCompass,
  FiMapPin,
  FiCamera,
} from "react-icons/fi";

// --- Background Images ---
import wp from "../../public/whiteWater.jpg";
import bp from "../../public/bp.jpg";

// ✅ 2. Import MapDisplay แบบ Dynamic
const MapDisplay = dynamic(() => import('../components/MapDisplay'), {
    ssr: false,
    loading: () => <p className="text-center text-gray-500">กำลังโหลดแผนที่...</p>
});

// ✅ 3. อัปเดต Interface ให้มี latitude และ longitude
interface PostFromSupabase {
  id: string;
  title: string;
  description: string;
  image_url: string | string[] | null;
  place_type: string;
  province: string;
  latitude: number;  // <-- เพิ่ม
  longitude: number; // <-- เพิ่ม
}

interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string[];
  place_type: string;
  province: string;
  latitude: number;  // <-- เพิ่ม
  longitude: number; // <-- เพิ่ม
}

const PostDetailsUI: React.FC = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const postId = searchParams.get("id");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // --- ดึงข้อมูลโพสต์จาก Supabase ---
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*") // ดึงมาทั้งหมด (รวม lat/lng)
          .eq("id", postId)
          .single<PostFromSupabase>();
          
        if (error) throw error;

        const safeParseImages = (imageUrlField: any): string[] => {
            if (!imageUrlField) return [];
            if (Array.isArray(imageUrlField)) return imageUrlField;
            try {
                const parsed = JSON.parse(imageUrlField);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        };
        
        // แปลงข้อมูล
        const parsedPost: Post = {
          id: data.id,
          title: data.title,
          description: data.description,
          place_type: data.place_type,
          province: data.province,
          image_url: safeParseImages(data.image_url),
          latitude: data.latitude, // <-- เพิ่ม
          longitude: data.longitude, // <-- เพิ่ม
        };
        
        setPost(parsedPost);
      } catch (err) {
        console.error("❌ Error fetching post:", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  // --- Loading UI ---
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${ darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-blue-100 to-pink-100 text-black" }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-400 border-opacity-50"></div>
        <span className="ml-4 text-xl font-bold">กำลังโหลด...</span>
      </div>
    );
  }

  // --- No Post Found UI ---
  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-screen flex flex-col items-center justify-center text-lg font-semibold ${ darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-blue-100 to-pink-100 text-black" } p-4`}
      >
        <p className="mb-6 text-2xl">ไม่พบโพสต์ที่คุณกำลังมองหา 😞</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 border border-blue-400 dark:border-pink-400 rounded-lg font-semibold shadow-md bg-white dark:bg-black hover:bg-blue-50 dark:hover:bg-gray-900 dark:text-white transition-all duration-300 text-lg"
        >
          <FiArrowLeft />
          ย้อนกลับ
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="font-sriracha flex flex-col min-h-screen">
      <Navbar />

      <div
        className="relative bg-fixed bg-center bg-cover transition duration-500 flex-1 py-12 md:py-20"
        style={{ backgroundImage: `url(${darkMode ? bp.src : wp.src})` }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto p-6 md:p-10 rounded-3xl shadow-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border border-blue-300 dark:border-pink-500"
        >
          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 mb-8 text-blue-700 dark:text-pink-300 font-semibold hover:underline transition-all duration-300"
          >
            <FiArrowLeft className="text-xl" />
            <span className="text-lg">ย้อนกลับ</span>
          </motion.button>

          {/* Title */}
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white text-center leading-tight">
            {post.title}
          </motion.h1>

          {/* Tags */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-base font-medium dark:bg-blue-900 dark:text-blue-200 shadow-sm">
              <FiCompass className="mr-2" /> {post.place_type}
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-base font-medium dark:bg-green-900 dark:text-green-200 shadow-sm">
              <FiMapPin className="mr-2" /> {post.province}
            </span>
          </motion.div>

          {/* Image Gallery */}
          {post.image_url && post.image_url.length > 0 && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {post.image_url.map((url, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLightboxIndex(index)}
                  className="relative aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-lg cursor-pointer transition-all duration-300 group"
                >
                  <Image
                    src={url}
                    alt={`รูป ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FiCamera className="text-white text-3xl" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Description */}
          <motion.p variants={itemVariants} className="text-lg text-gray-800 dark:text-gray-200 mb-10 leading-relaxed whitespace-pre-line text-left">
            {post.description}
          </motion.p>
          
          {/* ✅ 4. เพิ่มส่วนแสดงผลแผนที่ */}
          {post.latitude && post.longitude && (
              <motion.div variants={itemVariants} className="my-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      ตำแหน่งที่ตั้ง
                  </h3>
                  <div className="rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 shadow-lg">
                      <MapDisplay 
                          latitude={post.latitude} 
                          longitude={post.longitude} 
                      />
                  </div>
              </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/chat?id=${post.id}&title=${encodeURIComponent(post.title)}`)}
              className="flex-1 w-full sm:w-auto py-3 px-6 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow-lg hover:from-pink-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            >
              <FiMessageSquare />
              เข้าร่วมพูดคุย
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <Footer />

      {/* --- Lightbox Component --- */}
      {post.image_url.length > 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          index={lightboxIndex}
          close={() => setLightboxIndex(-1)}
          slides={post.image_url.map((url) => ({ src: url }))}
          plugins={[Zoom, Fullscreen, Thumbnails]}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
          controller={{ closeOnBackdropClick: true }}
          carousel={{ finite: post.image_url.length <= 1 }}
          render={{
            thumbnail: ({ slide, rect }) => (
              <div style={{ width: rect.width, height: rect.height }}>
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            ),
          }}
        />
      )}
    </div>
  );
};

export default PostDetailsUI;