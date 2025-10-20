"use client";

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { BsCardImage } from "react-icons/bs";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

type Post = {
  id: string;
  title: string;
  description: string;
  place_type: string;
  province: string;
  image_url: string[];
};

const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const provinces = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "เชียงใหม่",
  "อุบลราชธานี",
];

const EditPost: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const { darkMode } = useContext(ThemeContext) || { darkMode: false };

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [placeType, setPlaceType] = useState("");
  const [province, setProvince] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // --- Fetch post data ---
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error || !data) {
        toast.error("ไม่พบโพสต์ที่ต้องการแก้ไข");
        router.push("/post_pages");
        return;
      }

      const imagesArray: string[] =
        typeof data.image_url === "string"
          ? JSON.parse(data.image_url || "[]")
          : data.image_url || [];

      setPost({
        id: data.id,
        title: data.title,
        description: data.description || "",
        place_type: data.place_type,
        province: data.province || "",
        image_url: imagesArray,
      });

      setTitle(data.title);
      setDescription(data.description || "");
      setPlaceType(data.place_type);
      setProvince(data.province || "");
      setExistingImages(imagesArray);
      setNewImages([]);
      setNewImagePreviews([]);
    };

    fetchPost();
  }, [postId, router]);

  // --- Handle image selection ---
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - existingImages.length - newImages.length;
    if (remainingSlots <= 0) {
      toast.error("คุณสามารถเพิ่มรูปได้สูงสุด 5 รูปรวมกัน");
      e.target.value = "";
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    setNewImages((prev) => [...prev, ...selectedFiles]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...selectedFiles.map((file) => URL.createObjectURL(file)),
    ]);

    e.target.value = "";
  };

  // --- Remove existing image ---
  const handleRemoveExistingImage = async (idx: number) => {
    const imageUrl = existingImages[idx];
    const filePath = imageUrl.split("/storage/v1/object/public/post_image/")[1];

    if (filePath) {
      const { error } = await supabase.storage
        .from("post_image")
        .remove([filePath]);
      if (error) {
        toast.error("ลบรูปไม่สำเร็จ: " + error.message);
        return;
      }
    }

    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // --- Clean up Object URLs ---
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  // --- Submit edited post ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!post) return;

    if (!placeType) return toast.error("กรุณาเลือกประเภทสถานที่");
    if (!province) return toast.error("กรุณาเลือกจังหวัด");

    setSaving(true);

    let uploadedImageUrls = [...existingImages]; // ใช้ state ล่าสุด

    // Upload new images
    for (const file of newImages) {
      const filePath = `posts/${post.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("post_image")
        .upload(filePath, file);

      if (uploadError) {
        toast.error("อัปโหลดรูปภาพล้มเหลว: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("post_image")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl)
        uploadedImageUrls.push(publicUrlData.publicUrl);
    }

    // Update DB
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        description,
        place_type: placeType,
        province,
        image_url: uploadedImageUrls,
      })
      .eq("id", post.id);

    setSaving(false);

    if (error) toast.error("แก้ไขโพสต์ล้มเหลว: " + error.message);
    else {
      toast.success("แก้ไขโพสต์เรียบร้อยแล้ว");
      router.push("/post_pages");
    }
  };

  if (!post) return <p className="text-center mt-24">กำลังโหลดโพสต์...</p>;

  return (
    <div
      className={`font-sriracha relative bg-fixed bg-center bg-cover transition duration-500 flex-1 min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar />
      <div className="py-24 min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto p-8 bg-white/90 dark:bg-secondary/90 rounded-2xl shadow-2xl border border-blue-300 dark:border-pink-400">
          <h2 className="text-3xl font-extrabold mb-8 text-center text-black dark:text-primary tracking-tight">
            แก้ไขโพสต์
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-black">
                ชื่อร้าน / โพสต์
              </label>
              <input
                type="text"
                placeholder="ชื่อร้าน / โพสต์"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border focus:outline-none focus:ring-2 focus:ring-blue-400 text-black rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            {/* Description */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-black">
                รายละเอียด
              </label>
              <textarea
                placeholder="รายละเอียด"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border focus:outline-none focus:ring-2 focus:ring-blue-400 text-secondary rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white"
                rows={4}
                required
              />
            </div>
            {/* Selects */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-semibold text-black">
                  ประเภท
                </label>
                <select
                  value={placeType}
                  onChange={(e) => setPlaceType(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-blue-50 dark:bg-blue-500 text-white"
                >
                  <option value="">เลือกประเภท</option>
                  {placeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-semibold text-black">
                  จังหวัด
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-green-50 dark:bg-green-500 text-white"
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Images */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-black">
                รูปภาพ
              </label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-full hover:bg-blue-200 dark:hover:bg-gray-700 transition"
              >
                <BsCardImage className="text-2xl" />
                เพิ่มรูปภาพ
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="grid grid-cols-4 gap-3 mt-3">
                {existingImages.map((src, idx) => (
                  <div key={`existing-${idx}`} className="relative w-full h-20">
                    <img
                      src={src}
                      alt={`existing-${idx}`}
                      className="w-full h-full object-cover rounded-lg border shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {newImagePreviews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative w-full h-20">
                    <img
                      src={src}
                      alt={`new-${idx}`}
                      className="w-full h-full object-cover rounded-lg border shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditPost;
