"use client";

import React, { useState, useRef, useContext, useEffect, ChangeEvent, FormEvent } from "react";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";

// --- Data ---
const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const provinces = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "เชียงใหม่", "อุบลราชธานี"];

// --- Type Definitions for Sub-components ---
type FormInputProps = {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any; // For other props like 'required', 'placeholder', 'type'
};

type FormTextAreaProps = {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  [key: string]: any; // For other props like 'required', 'placeholder'
};

type FormSelectProps = {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  [key: string]: any; // For other props like 'required'
};

// --- Sub-components for Form Fields (แก้ไข Type) ---

const FormInput = ({ label, ...props }: FormInputProps) => (
  <div>
    <label className="block mb-1 text-sm font-semibold text-[var(--foreground)] opacity-90">{label}</label>
    <input
      {...props}
      className="w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-500 text-[var(--foreground)] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700"
    />
  </div>
);

const FormTextArea = ({ label, ...props }: FormTextAreaProps) => (
  <div>
    <label className="block mb-1 text-sm font-semibold text-[var(--foreground)] opacity-90">{label}</label>
    <textarea
      {...props}
      rows={4}
      className="w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-500 text-[var(--foreground)] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700"
    />
  </div>
);

const FormSelect = ({ label, options, ...props }: FormSelectProps) => (
  <div className="flex-1">
    <label className="block mb-1 text-sm font-semibold text-[var(--foreground)] opacity-90">{label}</label>
    <select
      {...props}
      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{`เลือก${label}`}</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const ImageGridItem = ({ src, onRemove }: { src: string; onRemove: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="relative w-full aspect-square"
  >
    <img src={src} alt="preview" className="w-full h-full object-cover rounded-lg border shadow"/>
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 leading-none shadow-md transition-transform hover:scale-110"
    >
      <FiX size={12} />
    </button>
  </motion.div>
);

// --- Main Component ---
const CreatePost: React.FC = () => {
  const { darkMode } = useContext(ThemeContext) || { darkMode: false };
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [placeType, setPlaceType] = useState("");
  const [province, setProvince] = useState("");
  
  // UI States
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // ตรวจสอบการล็อกอินเมื่อเข้าสู่หน้า
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("กรุณาล็อกอินก่อนสร้างโพสต์");
        router.push("/login");
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    const totalImages = images.length + newFiles.length;

    if (totalImages > 5) {
      toast.error("คุณสามารถอัปโหลดได้สูงสุด 5 รูป");
      return;
    }

    setImages((prevFiles) => [...prevFiles, ...newFiles]);
    setImagePreviews((prevPreviews) => [
      ...prevPreviews,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]); // Clean up object URL
      return newPreviews;
    });
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
      return;
    }
    if (!title || !desc || !placeType || !province) {
      toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (images.length === 0) {
      toast.error("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("กำลังสร้างโพสต์...");

    const uploadedUrls: string[] = [];
    
    try {
      for (const file of images) {
        const fileName = `public/${user.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("post_image")
          .upload(fileName, file);

        if (error) throw new Error(`Upload error: ${error.message}`);
        
        const { data: urlData } = supabase.storage.from("post_image").getPublicUrl(data.path);
        uploadedUrls.push(urlData.publicUrl);
      }

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert([
          {
            user_id: user.id,
            title,
            description: desc,
            place_type: placeType,
            province,
            image_url: uploadedUrls,
          },
        ]);

      if (postError) throw new Error(`Post error: ${postError.message}`);

      toast.dismiss(loadingToast);
      toast.success("สร้างโพสต์เรียบร้อยแล้ว!");
      router.push("/post_pages");
      router.refresh(); 

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "เกิดข้อผิดพลาดในการสร้างโพสต์");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 bg-[var(--background)] text-[var(--foreground)]`}>
      <Toaster position="top-right" />
      <Navbar />
      <div className="py-24 min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10"
        >
          <h2 className="text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500 tracking-tight">
            สร้างโพสต์ใหม่
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <FormInput 
              label="ชื่อร้าน / โพสต์" 
              placeholder="เช่น: ร้านป้าตามสั่ง, หาดสวรรค์"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
            
            <FormTextArea 
              label="รายละเอียด" 
              placeholder="บอกเล่าประสบการณ์ของคุณ..."
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
              required 
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <FormSelect 
                label="ประเภท" 
                value={placeType} 
                onChange={(e) => setPlaceType(e.target.value)} 
                options={placeTypes} 
                required 
              />
              <FormSelect 
                label="จังหวัด" 
                value={province} 
                onChange={(e) => setProvince(e.target.value)} 
                options={provinces} 
                required 
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-[var(--foreground)] opacity-90">
                รูปภาพ (สูงสุด 5 รูป)
              </label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-pink-400 transition"
              >
                <FiUploadCloud className="text-xl" />
                คลิกเพื่ออัปโหลดรูปภาพ
              </button>
              <input
                ref={imageInputRef} type="file" accept="image/*" multiple
                onChange={handleImageChange} className="hidden" id="image-upload"
              />
              <AnimatePresence>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <ImageGridItem key={idx} src={src} onRemove={() => handleRemoveImage(idx)} />
                  ))}
                </div>
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังโพสต์..." : "โพสต์"}
            </motion.button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePost;