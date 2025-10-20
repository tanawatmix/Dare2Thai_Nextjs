"use client";
import React, { useState, ChangeEvent, FormEvent, useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { BsCardImage } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const provinces = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "เชียงใหม่",
  "อุบลราชธานี",
];

const CreatePost: React.FC = () => {
  const { darkMode } = useContext(ThemeContext) || { darkMode: false };
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [placeType, setPlaceType] = useState("");
  const [province, setProvince] = useState("");
  const router = useRouter();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selectedFiles = Array.from(files).slice(0, 5);
    setImages(selectedFiles);
    setImagePreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !desc || !placeType || !province) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length && i < 5; i++) {
      const file = images[i];
      const fileName = `public/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from("post_image")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error.message);
        continue;
      }

      const url = supabase.storage.from("post_image").getPublicUrl(data.path)
        .data.publicUrl;

      uploadedUrls.push(url);
    }

    // ✅ ดึง user ที่ล็อกอินอยู่
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("กรุณาเข้าสู่ระบบก่อนโพสต์");
      return;
    }

    // ✅ บันทึกโพสต์พร้อม user_id
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert([
        {
          user_id: user.id, // <--- เพิ่มตรงนี้
          title,
          description: desc,
          place_type: placeType,
          province,
          image_url: uploadedUrls,
        },
      ]);

    if (postError) {
      console.error("Error creating post:", postError.message);
      alert("สร้างโพสต์ไม่สำเร็จ");
      return;
    }

    alert("โพสต์เรียบร้อย!");
    router.push("/post_pages");
  };

  return (
    <div
      className="font-sriracha relative bg-fixed bg-center bg-cover flex-1"
      style={{
        backgroundImage: `url(${darkMode ? "/bp.jpg" : "/whiteWater.jpg"})`,
      }}
    >
      <Navbar />
      <div className="py-28">
        <div className="max-w-md mx-auto p-5 bg-white rounded-lg shadow-md border border-blue-400 dark:border-pink-400">
          <h2 className="text-xl font-semibold mb-4 text-center">โพสต์ใหม่</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="ชื่อร้าน / โพสต์"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border text-black rounded px-4 py-2"
              required
            />
            <textarea
              placeholder="รายละเอียด"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border text-black rounded px-4 py-2"
              rows={4}
              required
            />

            <div className="flex gap-2">
              <select
                value={placeType}
                onChange={(e) => setPlaceType(e.target.value)}
                className="w-1/2 p-2 border rounded"
                required
              >
                <option value="">เลือกประเภท</option>
                {placeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-1/2 p-2 border rounded"
                required
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="w-full bg-blue-400 text-white py-2 rounded flex justify-center items-center gap-2"
            >
              <BsCardImage /> เพิ่มรูปภาพ (สูงสุด 5)
            </button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              โพสต์
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePost;