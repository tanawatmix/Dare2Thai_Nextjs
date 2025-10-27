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
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { LatLngExpression, LatLngTuple } from "leaflet";
import { FaLocationArrow, FaExternalLinkAlt } from "react-icons/fa"; // Import icons

// Import MapPicker (which is now Google Maps)
const MapPicker = dynamic(() => import("../components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
      <p className="text-center text-gray-500">กำลังโหลดแผนที่...</p>
    </div>
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

const PROVINCE_COORDS: { [key: string]: LatLngExpression } = {
  กรุงเทพมหานคร: [13.7563, 100.5018],
  กระบี่: [8.0833, 98.9063],
  กาญจนบุรี: [14.0167, 99.5333],
  เชียงใหม่: [18.7883, 98.9853],
  อุบลราชธานี: [15.2289, 104.8567],
  "": [13.7563, 100.5018],
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
      className="w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-500 text-black  rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700"
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
  const [latitude, setLatitude] = useState<number>(13.7563);
  const [longitude, setLongitude] = useState<number>(100.5018);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([
    13.7563, 100.5018,
  ]);

  // UI States
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // ตรวจสอบการล็อกอินและดึงตำแหน่งปัจจุบัน
  useEffect(() => {
    const initializePage = async () => {
      // 1. ตรวจสอบผู้ใช้ก่อน
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("กรุณาล็อกอินก่อนสร้างโพสต์");
        router.push("/login");
        return; // หยุดการทำงาน
      }
      setUser(user);

      // 2. ถ้ามีผู้ใช้, พยายามดึงตำแหน่งปัจจุบัน
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLatitude(latitude);
            setLongitude(longitude);
            setMapCenter([latitude, longitude]);
            setLoading(false); // โหลดเสร็จ
          },
          (error) => {
            // ล้มเหลว: ใช้ค่าเริ่มต้น (กรุงเทพฯ)
            console.warn(`Geolocation error (${error.code}): ${error.message}`);
            // ไม่ต้องแสดง toast error ทุกครั้งที่โหลด
            // toast.error("ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้ ใช้ค่าเริ่มต้นแทน");
            setLoading(false); // โหลดเสร็จ
          }
        );
      } else {
        // เบราว์เซอร์ไม่รองรับ: ใช้ค่าเริ่มต้น
        console.warn("Geolocation not supported by this browser.");
        setLoading(false); // โหลดเสร็จ
      }
    };

    initializePage();
  }, [router]);

  // ฟังก์ชันสำหรับปุ่ม "ใช้ตำแหน่งปัจจุบัน"
  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      const locationToast = toast.loading("กำลังค้นหาตำแหน่งของคุณ...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          setMapCenter([latitude, longitude]);
          toast.dismiss(locationToast);
          toast.success("ปักหมุดที่ตำแหน่งปัจจุบันของคุณแล้ว!");
        },
        (error) => {
          toast.dismiss(locationToast);
          toast.error(`ไม่สามารถเข้าถึงตำแหน่ง: ${error.message}`);
        }
      );
    } else {
      toast.error("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
    }
  };

  // ✅ แก้ไข: อัปเดตเฉพาะ Place Type state, ไม่ยุ่งกับ Title state
  const handlePlaceTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setPlaceType(newType);
    // ไม่ต้องทำอะไรกับ state `title` แล้ว
  };

  // 7. ฟังก์ชันใหม่สำหรับ Handle จังหวัด (คงเดิม)
  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    setProvince(newProvince);
    const defaultCoord: LatLngTuple = [13.7563, 100.5018];
    const newCenter = (PROVINCE_COORDS[newProvince] ||
      defaultCoord) as LatLngTuple;
    setMapCenter(newCenter);
    setLatitude(newCenter[0]);
    setLongitude(newCenter[1]);
  };

  // 8. ฟังก์ชันสำหรับอัปเดตพิกัด (จากการลากหมุด หรือ ค้นหา) (คงเดิม)
  const handleMapUpdate = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setMapCenter([lat, lng]);
  };

  // Image Handlers (คงเดิม)
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

  // --- Submit Handler --- (คงเดิม)
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
    if (!latitude || !longitude) {
      toast.error("กรุณาปักหมุดตำแหน่งบนแผนที่");
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
      // 1. อัปโหลดรูปภาพ
      for (const file of images) {
        const fileName = `public/${user.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("post_image")
          .upload(fileName, file);
        if (error) throw new Error(`Upload error: ${error.message}`);
        const { data: urlData } = supabase.storage
          .from("post_image")
          .getPublicUrl(data.path);
        uploadedUrls.push(urlData.publicUrl);
      }

      // 2. บันทึกข้อมูลโพสต์ (เพิ่ม lat/lng)
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
            latitude: latitude,
            longitude: longitude,
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

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
            สร้างโพสต์ใหม่
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
              placeholder={
                placeType
                  ? `เช่น: (${placeType}) ชื่อสถานที่...`
                  : "เช่น: ร้านป้าตามสั่ง, หาดสวรรค์ (เลือกประเภทก่อน)"
              }
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-white">
                  ปักหมุดตำแหน่ง (คลิก, ลาก, หรือค้นหา)
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:underline"
                >
                  <FaLocationArrow size={10} />
                  ใช้ตำแหน่งปัจจุบัน
                </button>
              </div>
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
                คลิกเพื่ออัปโหลดรูปภาพ
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <AnimatePresence>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <ImageGridItem
                      key={idx}
                      src={src}
                      onRemove={() => handleRemoveImage(idx)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </div>

            <div className="flex gap-4">
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
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "กำลังโพสต์..." : "โพสต์"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePost;
