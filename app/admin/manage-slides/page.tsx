"use client";

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  ChangeEvent,
  FormEvent,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeContext } from "../../ThemeContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSave,
  FiXCircle,
  FiTrash2,
  FiEdit,
  FiImage,
  FiArrowLeft,
  FiLoader,
  FiX,
  FiType,
  FiFileText
} from "react-icons/fi";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  created_at: string;
  author_id?: string;
};

const LoadingComponent = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
    <svg
      className="animate-spin h-10 w-10 text-blue-500 dark:text-pink-400"
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
    <p className="text-lg text-[var(--foreground)] opacity-80 mt-2">{text}</p>
  </div>
);

const ManageSlidesContent: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [slideList, setSlideList] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] =
    useState<Partial<Slide> | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAdminAndFetch = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (!isMounted) return;
      if (!currentUser) {
        toast.error("กรุณาล็อกอิน");
        router.push("/login");
        return;
      }
      setUser(currentUser);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (!isMounted) return;
      if (profile?.role !== "admin") {
        toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        router.push("/");
        return;
      }
      setIsAdmin(true);

      if (editId) {
        const { data: slideToEdit, error: fetchError } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("id", editId)
          .single();

        if (!isMounted) return;
        if (fetchError || !slideToEdit) {
          toast.error("ไม่พบสไลด์ที่ต้องการแก้ไข");
          router.push("/admin");
        } else {
          setEditingSlide(slideToEdit);
          setTitle(slideToEdit.title || "");
          setSubtitle(slideToEdit.subtitle || "");
          setExistingImageUrl(slideToEdit.image_url);
          setImagePreview(slideToEdit.image_url);
          setImageFile(null);
          if(imageInputRef.current) imageInputRef.current.value = "";
        }
      } else {
        localResetFormStates();
      }
      setLoading(false);
    };
    checkAdminAndFetch();
    return () => { isMounted = false; };
  }, [editId, router]);

   const localResetFormStates = () => {
        setEditingSlide(null);
        setTitle("");
        setSubtitle("");
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
   };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
   };

  const handleRemoveImage = () => {
     setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
   };

  const resetFormAndGoBack = () => {
     localResetFormStates();
     router.push("/admin");
   };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    
    if (!editingSlide?.id && !imageFile) {
        toast.error("กรุณาเลือกรูปภาพสำหรับสไลด์ใหม่");
        return;
    }
    if (!imagePreview) {
        toast.error("กรุณาเลือกรูปภาพ");
        return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingSlide?.id ? "กำลังอัปเดตสไลด์..." : "กำลังสร้างสไลด์..."
    );

    let finalImageUrl: string | null = existingImageUrl;

    try {
      if (imageFile) {
        if (existingImageUrl) {
          const oldFileName = existingImageUrl.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from("hero_images").remove([`public/${oldFileName}`]);
          }
        }
        const fileExt = imageFile.name.split(".").pop();
        const newFileName = `${user.id}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("hero_images") // Use 'hero_images' bucket
          .upload(`public/${newFileName}`, imageFile);

        if (uploadError) throw new Error(`Image upload error: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from("hero_images").getPublicUrl(uploadData.path);
        finalImageUrl = urlData.publicUrl;
      }
      if (!finalImageUrl) {
         throw new Error("เกิดข้อผิดพลาด: ไม่พบ URL รูปภาพ");
      }

      const slideData = {
        title: title.trim() || null,
        subtitle: subtitle.trim() || null,
        image_url: finalImageUrl,
        author_id: user.id
      };

      if (editingSlide?.id) {
        const { error: updateError } = await supabase
          .from("hero_slides")
          .update(slideData)
          .eq("id", editingSlide.id);
        if (updateError) throw updateError;
        toast.success("อัปเดตสไลด์เรียบร้อยแล้ว!");
      } else {
        const { error: insertError } = await supabase
          .from("hero_slides")
          .insert({ ...slideData, created_at: new Date().toISOString() });
        if (insertError) throw insertError;
        toast.success("สร้างสไลด์ใหม่เรียบร้อยแล้ว!");
      }

      toast.dismiss(loadingToast);
      resetFormAndGoBack();

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "เกิดข้อผิดพลาด");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingComponent text="กำลังโหลด..." />;

  return (
    <>
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <Toaster position="top-center" />

        <motion.button
            onClick={resetFormAndGoBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 mb-6 text-sm font-medium transition-colors ${ darkMode ? 'text-gray-400 hover:text-pink-400' : 'text-gray-600 hover:text-blue-600'}`}>
             <FiArrowLeft /> กลับไปหน้า Admin หลัก
         </motion.button>

        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-6 sm:p-8 rounded-2xl shadow-lg border mb-12 ${ darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200" }`}>
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
            {editingSlide?.id ? "แก้ไขสไลด์" : "สร้างสไลด์ใหม่"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                หัวข้อ (ไม่บังคับ)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ภูเก็ต สวรรค์แห่งทะเล"
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${ darkMode ? 'bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500' }`}
              />
            </div>
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium mb-1">
                คำบรรยาย (ไม่บังคับ)
              </label>
                <textarea
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="เช่น เที่ยวทะเล ดำน้ำ ดูพระอาทิตย์ตก"
                    rows={3}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${ darkMode ? 'bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500' }`}
                />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                รูปภาพ (จำเป็น)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition hover:border-opacity-70 ${
                      darkMode
                        ? "border-gray-600 text-gray-400 hover:border-pink-400"
                        : "border-gray-300 text-gray-500 hover:border-blue-400"
                    }`}
                  >
                    <FiImage /> {imagePreview ? "เปลี่ยนรูปภาพ" : "เลือกรูปภาพ"}
                  </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!editingSlide?.id}
                />
                 {imagePreview && (
                    <div className="relative w-48 h-27 aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg shadow">
                        <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none shadow-md transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            aria-label="Remove image"
                        >
                            <FiX size={14}/>
                        </button>
                    </div>
                 )}
              </div>
               {!imagePreview && <p className="text-xs text-red-500 dark:text-red-400 mt-2">กรุณาเลือกรูปภาพ</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <motion.button
                type="submit"
                disabled={isSubmitting || !imagePreview} 
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 px-4 rounded-lg font-semibold shadow transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                    darkMode
                    ? "bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                    : "bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
                 }`}
              >
                {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
                {editingSlide?.id ? (isSubmitting ? "กำลังอัปเดต..." : "บันทึกการแก้ไข") : (isSubmitting ? "กำลังสร้าง..." : "สร้างสไลด์")}
              </motion.button>
              
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={resetFormAndGoBack}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold shadow transition duration-200 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                <FiXCircle /> {editingSlide?.id ? "ยกเลิกการแก้ไข" : "ยกเลิก"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </>
  );
};
export default function ManageSlidesPageWrapper() {
     const { darkMode } = useContext(ThemeContext);

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${ darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900" }`}>
             <Navbar />
             <Suspense fallback={<LoadingComponent text="กำลังโหลด..." />}>
                 <ManageSlidesContent />
             </Suspense>
             <Footer />
        </div>
    );
}
