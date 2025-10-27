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
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { LatLngExpression, LatLngTuple } from "leaflet";
import { FaLocationArrow, FaExternalLinkAlt } from "react-icons/fa"; // Import icons

// 3. Import MapPicker แบบ Dynamic
const MapPicker = dynamic(() => import("../components/MapPicker"), {
  ssr: false, // ปิด Server-Side Rendering
  loading: () => (
    <p className="text-center text-gray-500">กำลังโหลดแผนที่...</p>
  ),
});

// --- Data ---
const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const provinces = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "เชียงใหม่",
  "อุบลราชธานี",
];

// 4. สร้าง Object เก็บพิกัดของแต่ละจังหวัด
const PROVINCE_COORDS: { [key: string]: LatLngExpression } = {
  กรุงเทพมหานคร: [13.7563, 100.5018],
  กระบี่: [8.0833, 98.9063],
  กาญจนบุรี: [14.0167, 99.5333],
  เชียงใหม่: [18.7883, 98.9853],
  อุบลราชธานี: [15.2289, 104.8567],
  "": [13.7563, 100.5018], // ค่าเริ่มต้น (กทม.)
};

// --- Type Definitions ---
type Post = {
  id: string;
  title: string;
  description: string;
  place_type: string;
  province: string;
  image_url: string[];
  user_id: string;
  latitude: number; // 5. เพิ่ม latitude
  longitude: number; // 6. เพิ่ม longitude
};

// --- Type Definitions for Sub-components ---
type FormInputProps = {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
};
type FormTextAreaProps = {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  [key: string]: any;
};
type FormSelectProps = {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  [key: string]: any;
};

// --- Sub-components for Form Fields ---
const FormInput = ({ label, ...props }: FormInputProps) => (
  <div>
    <label className="block mb-1 text-sm font-semibold text-white">
      {label}
    </label>
    <input
      {...props}
      className="w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-500 text-black dark:text-white rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700"
    />
  </div>
);
const FormTextArea = ({ label, ...props }: FormTextAreaProps) => (
  <div>
    <label className="block mb-1 text-sm font-semibold text-white">
      {label}
    </label>
    <textarea
      {...props}
      rows={4}
      className="w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-500 text-black dark:text-white rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700"
    />
  </div>
);
const FormSelect = ({ label, options, ...props }: FormSelectProps) => (
  <div className="flex-1">
    <label className="block mb-1 text-sm font-semibold text-white">
      {label}
    </label>
    <select
      {...props}
      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{`เลือก${label}`}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
const ImageGridItem = ({
  src,
  onRemove,
}: {
  src: string;
  onRemove: () => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="relative w-full aspect-square"
  >
    <img
      src={src}
      alt="preview"
      className="w-full h-full object-cover rounded-lg border shadow"
    />
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
const EditPost: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const { darkMode } = useContext(ThemeContext) || { darkMode: false };

  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [placeType, setPlaceType] = useState("");
  const [province, setProvince] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // 7. เพิ่ม State สำหรับพิกัด (ใช้ค่าเริ่มต้น กทม.)
  const [latitude, setLatitude] = useState<number>(13.7563);
  const [longitude, setLongitude] = useState<number>(100.5018);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([
    13.7563, 100.5018,
  ]);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // --- Fetch post data & Check Ownership ---
  useEffect(() => {
    if (!postId) {
      toast.error("ไม่พบ ID ของโพสต์");
      router.push("/post_pages");
      return;
    }

    const fetchUserAndPost = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("กรุณาล็อกอินก่อนแก้ไขโพสต์");
        router.push("/login");
        return;
      }
      setUser(user);

      // 8. ดึงข้อมูลโพสต์ (รวม lat/lng)
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

      // 9. ตรวจสอบความเป็นเจ้าของ
      if (data.user_id !== user.id) {
        toast.error("คุณไม่มีสิทธิ์แก้ไขโพสต์นี้");
        router.push("/post_pages");
        return;
      }

      const imagesArray: string[] =
        typeof data.image_url === "string"
          ? JSON.parse(data.image_url || "[]")
          : data.image_url || [];

      // 10. ตั้งค่า State ทั้งหมด
      setPost(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setPlaceType(data.place_type);
      setProvince(data.province || "");
      setExistingImages(imagesArray);

      // 11. ตั้งค่าพิกัดจากข้อมูลที่ดึงมา
      const initialLat = data.latitude || 13.7563;
      const initialLng = data.longitude || 100.5018;
      setLatitude(initialLat);
      setLongitude(initialLng);
      setMapCenter([initialLat, initialLng]);

      setLoading(false);
    };

    fetchUserAndPost();
  }, [postId, router]);

  // 12. ฟังก์ชันสำหรับอัปเดต Title เมื่อเลือก Type
  const handlePlaceTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setPlaceType(newType);

    if (newType && (!title || placeTypes.includes(title))) {
      setTitle(newType);
    } else if (!newType && placeTypes.includes(title)) {
      setTitle("");
    }
  };

  // 13. ฟังก์ชันใหม่สำหรับ Handle จังหวัด
  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    setProvince(newProvince);

    // 1. กำหนด Type ของค่าเริ่มต้นให้ชัดเจน
    const defaultCoord: LatLngTuple = [13.7563, 100.5018];

    // 2. Cast newCenter ให้เป็น LatLngTuple (array)
    const newCenter = (PROVINCE_COORDS[newProvince] ||
      defaultCoord) as LatLngTuple;

    setMapCenter(newCenter);
    setLatitude(newCenter[0]); // 3. ไม่ต้องใช้ 'as number'
    setLongitude(newCenter[1]); // 4. ไม่ต้องใช้ 'as number'
  };

  // 14. ฟังก์ชันสำหรับอัปเดตพิกัด (จากการลากหมุด หรือ ค้นหา)
  const handleMapUpdate = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setMapCenter([lat, lng]);
  };

  // --- Image Handlers ---
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remainingSlots = 5 - existingImages.length - newImages.length;
    if (remainingSlots <= 0) {
      toast.error("คุณสามารถเพิ่มรูปได้สูงสุด 5 รูปรวมกัน");
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

  const handleRemoveExistingImage = (idx: number) => {
    const imageUrl = existingImages[idx];
    const path = imageUrl.substring(
      imageUrl.indexOf("/post_image/") + "/post_image/".length
    );
    if (path) {
      supabase.storage
        .from("post_image")
        .remove([path])
        .then(({ error }) => {
          if (error) toast.error("ลบรูปไม่สำเร็จ: " + error.message);
          else setExistingImages((prev) => prev.filter((_, i) => i !== idx));
        });
    } else {
      setExistingImages((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleRemoveNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== idx);
      URL.revokeObjectURL(prev[idx]);
      return newPreviews;
    });
  };

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  // --- Submit edited post ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!post || !user) return;
    if (!placeType) return toast.error("กรุณาเลือกประเภทสถานที่");
    if (!province) return toast.error("กรุณาเลือกจังหวัด");
    if (!latitude || !longitude) {
      toast.error("กรุณาปักหมุดตำแหน่งบนแผนที่");
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading("กำลังบันทึกการแก้ไข...");
    let uploadedImageUrls = [...existingImages];

    try {
      // Upload new images
      for (const file of newImages) {
        const filePath = `public/${user.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post_image")
          .upload(filePath, file);

        if (uploadError)
          throw new Error(`อัปโหลดรูปภาพล้มเหลว: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from("post_image")
          .getPublicUrl(uploadData.path);

        if (publicUrlData?.publicUrl) {
          uploadedImageUrls.push(publicUrlData.publicUrl);
        }
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
          latitude: latitude, // 15. อัปเดตพิกัด
          longitude: longitude, // 15. อัปเดตพิกัด
        })
        .eq("id", post.id);

      if (error) throw new Error(`แก้ไขโพสต์ล้มเหลว: ${error.message}`);

      toast.dismiss(loadingToast);
      toast.success("แก้ไขโพสต์เรียบร้อยแล้ว");
      router.push("/post_pages");
      router.refresh();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !post)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-4 text-[var(--foreground)]">กำลังโหลดโพสต์...</span>
      </div>
    );

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster position="top-right" />
      <Navbar />
      <div className="py-24 min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative border-2 bg-black/70 border-blue-400 dark:border-pink-400 rounded-3xl shadow-2xl p-10 max-w-lg w-full backdrop-blur-lg"
        >
          <h2 className="text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500 tracking-tight">
            แก้ไขโพสต์
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <FormSelect
                label="ประเภท"
                value={placeType}
                onChange={handlePlaceTypeChange}
                options={placeTypes}
                required
              />
              <FormSelect
                label="จังหวัด"
                value={province}
                onChange={handleProvinceChange}
                options={provinces}
                required
              />
            </div>

            <FormInput
              label="ชื่อร้าน / โพสต์"
              placeholder="ชื่อร้าน / โพสต์"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <FormTextArea
              label="รายละเอียด"
              placeholder="รายละเอียด"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* 16. เพิ่ม MapPicker */}
            <div>
              <label className="block text-sm font-semibold text-white">
                ปักหมุดตำแหน่ง (คลิก, ลาก, หรือค้นหา)
              </label>
              <div className="rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                <MapPicker
                  onLocationChange={handleMapUpdate}
                  center={mapCenter}
                  markerPosition={[latitude, longitude]}
                />
              </div>
              {latitude && (
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-white">
                    ปักหมุดแล้ว: Lat: {latitude.toFixed(4)}, Lng:{" "}
                    {longitude.toFixed(4)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-green-500 hover:underline"
                  >
                    เปิดใน Google Maps
                    <FaExternalLinkAlt size={10} />
                  </a>
                </div>
              )}
            </div>

            {/* ส่วนอัปโหลดรูปภาพ */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-white">
                รูปภาพ (สูงสุด 5 รูป)
              </label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-pink-400 transition"
              >
                <FiUploadCloud className="text-xl" />
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
              <AnimatePresence>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                  {existingImages.map((src, idx) => (
                    <ImageGridItem
                      key={`existing-${idx}`}
                      src={src}
                      onRemove={() => handleRemoveExistingImage(idx)}
                    />
                  ))}
                  {newImagePreviews.map((src, idx) => (
                    <ImageGridItem
                      key={`new-${idx}`}
                      src={src}
                      onRemove={() => handleRemoveNewImage(idx)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition"
              >
                ยกเลิก
              </motion.button>
              <motion.button
                type="submit"
                disabled={saving}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default EditPost;
