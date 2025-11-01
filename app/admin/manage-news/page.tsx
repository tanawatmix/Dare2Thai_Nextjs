"use client";

import React, { useState, useEffect, useContext, ChangeEvent, FormEvent, useRef, Suspense } from "react";
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
  FiPlus,
  FiImage,
  FiArrowLeft,
  FiLoader,
  FiX, 
} from "react-icons/fi";
import { User } from "@supabase/supabase-js";
import dynamic from 'next/dynamic';
import Image from "next/image";
 
const SimpleMarkdownEditor = dynamic(() => import('../../components/SimpleMarkdownEditor'), {
    ssr: false,
    loading: () => <div className="w-full h-40 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading editor...</p></div>
});


type NewsArticle = {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  author_id?: string;
};

// --- Loading Component ---
const LoadingComponent = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
        <svg className="animate-spin h-10 w-10 text-blue-500 dark:text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-[var(--foreground)] opacity-80 mt-2">{text}</p>
    </div>
);
 
const ManageNewsContent: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<Partial<NewsArticle> | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

      fetchNewsList();

      if (editId) {
        if (!editingArticle || editingArticle.id !== editId) {
            setLoading(true);
            const { data: articleToEdit, error: fetchError } = await supabase
                .from("news")
                .select("*")
                .eq("id", editId)
                .single();

            if (!isMounted) return;
            if (fetchError || !articleToEdit) {
                toast.error("ไม่พบข่าวที่ต้องการแก้ไข หรือเกิดข้อผิดพลาด");
                router.push("/admin/manage-news");
            } else {
                setEditingArticle(articleToEdit);
                setTitle(articleToEdit.title);
                setContent(articleToEdit.content);
                setExistingImageUrl(articleToEdit.image_url);
                setImagePreview(articleToEdit.image_url);
                setImageFile(null);
                 if(imageInputRef.current) imageInputRef.current.value = "";
            }
            setLoading(false);
        } else {
             setLoading(false);
        }
      } else {
        if (editingArticle) {
            localResetFormStates();
        }
         setLoading(false);
      }
    };

    checkAdminAndFetch();
    return () => { isMounted = false; };

  }, [editId, router, editingArticle]);


  const fetchNewsList = async () => {
    const { data, error } = await supabase
      .from("news")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("ไม่สามารถโหลดรายการข่าวได้");
    } else {
      setNewsList(data as NewsArticle[]);
    }
  };

   const localResetFormStates = () => {
        setEditingArticle(null);
        setTitle("");
        setContent("");
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
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
   };
  const handleRemoveImage = () => {
     setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
   };

  const resetForm = () => {
     localResetFormStates();
     router.push("/news", { scroll: false });
   };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    if (!title.trim() || !content.trim()) {
      toast.error("กรุณากรอกหัวข้อและเนื้อหาข่าว");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingArticle?.id ? "กำลังอัปเดตข่าว..." : "กำลังสร้างข่าว..."
    );

    let finalImageUrl: string | null = existingImageUrl;

    try {
      if (imageFile) {
        if (existingImageUrl) {
          const oldFileName = existingImageUrl.split("/").pop();
          if (oldFileName) {
            await supabase.storage
              .from("news_images")
              .remove([`public/${oldFileName}`]);
          }
        }
        const fileExt = imageFile.name.split(".").pop();
        const newFileName = `${user.id}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("news_images")
          .upload(`public/${newFileName}`, imageFile);

        if (uploadError)
          throw new Error(`Image upload error: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from("news_images")
          .getPublicUrl(uploadData.path);
        finalImageUrl = urlData.publicUrl;
      } else if (existingImageUrl && !imagePreview) {
        const oldFileName = existingImageUrl.split("/").pop();
        if (oldFileName) {
          await supabase.storage
            .from("news_images")
            .remove([`public/${oldFileName}`]);
        }
        finalImageUrl = null;
      }

      const newsData = {
        title: title.trim(),
        content: content.trim(),
        image_url: finalImageUrl,
        author_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (editingArticle?.id) {
        const { error: updateError } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingArticle.id);
        if (updateError) throw updateError;
        toast.success("อัปเดตข่าวเรียบร้อยแล้ว!");
      } else {
        const { error: insertError } = await supabase
          .from("news")
          .insert({ ...newsData, created_at: new Date().toISOString() });
        if (insertError) throw insertError;
        toast.success("สร้างข่าวเรียบร้อยแล้ว!");
      }

      toast.dismiss(loadingToast);
      resetForm();
      fetchNewsList();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "เกิดข้อผิดพลาด");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
   };

  const handleDelete = async (articleId: string, articleTitle: string) => {
     if (!isAdmin) return;
     try {
      await toast.promise(
        new Promise<void>((resolve, reject) => {
          import("sweetalert2").then(async (Swal) => {
            const confirmResult = await Swal.default.fire({
              title: `ต้องการลบข่าว "${articleTitle}"?`,
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
              reject(new Error("User cancelled"));
            }
          });
        }),
        {
          loading: "กำลังลบ...",
          success: "ลบข่าวสำเร็จ!",
          error: (err: any) =>
            err.message === "User cancelled" ? "ยกเลิกการลบ" : "เกิดข้อผิดพลาด",
        }
      );

      const articleToDelete = newsList.find((n) => n.id === articleId);
      if (articleToDelete?.image_url) {
        const fileName = articleToDelete.image_url.split("/").pop();
        if (fileName) {
          await supabase.storage
            .from("news_images")
            .remove([`public/${fileName}`]);
        }
      }

      const { error: deleteError } = await supabase
        .from("news")
        .delete()
        .eq("id", articleId);

      if (deleteError) throw deleteError;

      fetchNewsList();
      if (editingArticle?.id === articleId) resetForm();
    } catch (error: any) {
      if (error.message !== "User cancelled") {
        toast.error(`ลบไม่สำเร็จ: ${error.message}`);
        console.error("Delete error:", error);
      }
    }
   };

  if (loading) return <LoadingComponent text="กำลังโหลด..." />;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("th-TH");

  return (
    <> 
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <Toaster position="top-center" />

        <motion.button
            onClick={() => router.push("/news")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 mb-6 text-sm font-medium transition-colors ${ darkMode ? 'text-gray-400 hover:text-pink-400' : 'text-gray-600 hover:text-blue-600'}`}>
             <FiArrowLeft /> กลับไปหน้าNEWS
         </motion.button>

        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-6 sm:p-8 rounded-2xl shadow-lg border mb-12 ${ darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200" }`}>
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
            {editingArticle?.id ? "แก้ไขข่าวสาร" : "สร้างข่าวสารใหม่"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">หัวข้อข่าว</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${ darkMode ? 'bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500' }`} />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">เนื้อหา</label>
              <input type="text" id="content" value={content} onChange={(e) => setContent(e.target.value)} required
                className={`w-full p-15 border rounded-lg focus:outline-none focus:ring-2 transition ${ darkMode ? 'bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500' }`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">รูปภาพประกอบ (Optional)</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <button type="button" onClick={() => imageInputRef.current?.click()}
                    className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition hover:border-opacity-70 ${ darkMode ? 'border-gray-600 text-gray-400 hover:border-pink-400' : 'border-gray-300 text-gray-500 hover:border-blue-400' }`}>
                    <FiImage /> {imagePreview ? "เปลี่ยนรูปภาพ" : "เลือกรูปภาพ"}
                  </button>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                 {imagePreview && (
                    <div className="relative w-24 h-24 mt-2 sm:mt-0">
                        <Image src={imagePreview} alt="Preview" fill style={{objectFit: 'cover'}} className="rounded-lg shadow"/>
                        <button type="button" onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none shadow-md transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            aria-label="Remove image">
                            <FiX size={14}/>
                        </button>
                    </div>
                 )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <motion.button type="submit" disabled={isSubmitting} whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 px-4 rounded-lg font-semibold shadow transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${ darkMode ? "bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600" : "bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600" }`}>
                {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
                {editingArticle?.id ? (isSubmitting ? "กำลังอัปเดต..." : "บันทึกการแก้ไข") : (isSubmitting ? "กำลังสร้าง..." : "สร้างข่าว")}
              </motion.button>
              {editingArticle?.id && (
                 <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={resetForm}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold shadow transition duration-200 ${ darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                   <FiXCircle /> ยกเลิกการแก้ไข
                  </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        <h2 className="text-xl font-semibold mb-4 mt-10">รายการข่าวทั้งหมด</h2>
        <div className={`rounded-lg shadow-md border overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <ul className={`divide-y ${ darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {newsList.length === 0 && !loading ? (
                    <li className="p-4 text-center text-gray-500">ไม่มีข่าวสาร</li>
                ) : (
                    newsList.map(news => (
                        <li key={news.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div>
                                <span className="font-medium">{news.title}</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    สร้างเมื่อ: {formatDate(news.created_at)}
                                </p>
                            </div>
                            <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                <motion.button whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push(`/admin/manage-news?edit=${news.id}`)}
                                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium shadow transition">
                                    <FiEdit size={12}/> แก้ไข
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDelete(news.id, news.title)}
                                     className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium shadow transition">
                                    <FiTrash2 size={12}/> ลบ
                                 </motion.button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
      </main>
    </>
  );
};

export default function ManageNewsPageWrapper() {
     const { darkMode } = useContext(ThemeContext); 

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${ darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900" }`}>
             <Navbar />
             <Suspense fallback={<LoadingComponent text="กำลังโหลดหน้าจัดการข่าว..." />}>
                 <ManageNewsContent />
             </Suspense>
             <Footer />
        </div>
    );
}

