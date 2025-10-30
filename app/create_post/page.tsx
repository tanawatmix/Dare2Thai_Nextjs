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
import { FaLocationArrow, FaExternalLinkAlt } from "react-icons/fa";

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
const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม", "คาเฟ่", "ร้านขายของฝาก", "โรงเรียน", "วัด", "อื่นๆ"];
const provinces = [
    "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
    "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
    "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง",
    "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม",
    "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส",
    "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
    "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา",
    "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
    "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
    "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง",
    "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
    "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
    "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี",
    "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย",
    "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์",
    "อุทัยธานี", "อุบลราชธานี"
];

// ✅ Updated: Added approximate coordinates for all provinces
const PROVINCE_COORDS: { [key: string]: LatLngExpression } = {
    "กรุงเทพมหานคร": [13.7563, 100.5018],
    "กระบี่": [8.0833, 98.9063],
    "กาญจนบุรี": [14.0167, 99.5333],
    "กาฬสินธุ์": [16.4322, 103.5037],
    "กำแพงเพชร": [16.4828, 99.5229],
    "ขอนแก่น": [16.4383, 102.8333],
    "จันทบุรี": [12.6108, 102.1039],
    "ฉะเชิงเทรา": [13.6881, 101.0722],
    "ชลบุรี": [13.3611, 100.9847],
    "ชัยนาท": [15.1856, 100.1245],
    "ชัยภูมิ": [15.8089, 102.0333],
    "ชุมพร": [10.4939, 99.1800],
    "เชียงราย": [19.9095, 99.8325],
    "เชียงใหม่": [18.7883, 98.9853],
    "ตรัง": [7.5583, 99.6108],
    "ตราด": [12.2431, 102.5161],
    "ตาก": [16.8833, 99.1167],
    "นครนายก": [14.2078, 101.2117],
    "นครปฐม": [13.8167, 100.0625],
    "นครพนม": [17.4069, 104.7817],
    "นครราชสีมา": [14.9708, 102.1122],
    "นครศรีธรรมราช": [8.4358, 99.9628],
    "นครสวรรค์": [15.6961, 100.1189],
    "นนทบุรี": [13.8592, 100.5217],
    "นราธิวาส": [6.4258, 101.8256],
    "น่าน": [18.7778, 100.7786],
    "บึงกาฬ": [18.3617, 103.6528], // Approximate
    "บุรีรัมย์": [14.9950, 103.1017],
    "ปทุมธานี": [14.0208, 100.5283],
    "ประจวบคีรีขันธ์": [11.8081, 99.7961],
    "ปราจีนบุรี": [14.0494, 101.3717],
    "ปัตตานี": [6.8667, 101.2500],
    "พระนครศรีอยุธยา": [14.3547, 100.5667],
    "พะเยา": [19.1625, 99.9083],
    "พังงา": [8.4503, 98.5250],
    "พัทลุง": [7.6167, 100.0833],
    "พิจิตร": [16.4439, 100.3497],
    "พิษณุโลก": [16.8194, 100.2583],
    "เพชรบุรี": [13.1111, 99.9486],
    "เพชรบูรณ์": [16.4167, 101.1556],
    "แพร่": [18.1444, 100.1403],
    "ภูเก็ต": [7.9519, 98.3364],
    "มหาสารคาม": [16.1833, 103.3000],
    "มุกดาหาร": [16.5450, 104.7239],
    "แม่ฮ่องสอน": [19.3019, 97.9650],
    "ยโสธร": [15.7958, 104.1436],
    "ยะลา": [6.5417, 101.2806],
    "ร้อยเอ็ด": [16.0544, 103.6539],
    "ระนอง": [9.9658, 98.6347],
    "ระยอง": [12.6739, 101.2789],
    "ราชบุรี": [13.5417, 99.8167],
    "ลพบุรี": [14.7986, 100.6539],
    "ลำปาง": [18.2917, 99.4928],
    "ลำพูน": [18.5750, 99.0083],
    "เลย": [17.4858, 101.7297],
    "ศรีสะเกษ": [15.1194, 104.3236],
    "สกลนคร": [17.1583, 104.1444],
    "สงขลา": [7.1881, 100.5956],
    "สตูล": [6.6217, 100.0669],
    "สมุทรปราการ": [13.5992, 100.5967],
    "สมุทรสงคราม": [13.4125, 100.0019],
    "สมุทรสาคร": [13.5500, 100.2750],
    "สระแก้ว": [13.8206, 102.0700],
    "สระบุรี": [14.5306, 100.9111],
    "สิงห์บุรี": [14.8906, 100.4039],
    "สุโขทัย": [17.0047, 99.8261],
    "สุพรรณบุรี": [14.4719, 100.1181],
    "สุราษฎร์ธานี": [9.1389, 99.3289],
    "สุรินทร์": [14.8833, 103.4917],
    "หนองคาย": [17.8806, 102.7444],
    "หนองบัวลำภู": [17.2069, 102.4403],
    "อ่างทอง": [14.5878, 100.4550],
    "อำนาจเจริญ": [15.8600, 104.6269],
    "อุดรธานี": [17.4139, 102.7900],
    "อุตรดิตถ์": [17.6256, 100.0939],
    "อุทัยธานี": [15.3731, 100.0256],
    "อุบลราชธานี": [15.2289, 104.8567],
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
        toast.error("กรุณาล็อกอินก่อนแชร์การเดินทางของคุณ");
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
            setLoading(false);
          },
          (error) => {
            console.warn(`Geolocation error (${error.code}): ${error.message}`);
            setLoading(false); 
          }
        );
      } else {
        console.warn("Geolocation not supported by this browser.");
        setLoading(false);
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
      URL.revokeObjectURL(prev[index]);
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
    const loadingToast = toast.loading("กำลังแชร์การเดินทางของคุณ...");

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
      toast.success("แชร์การเดินทางของคุณเรียบร้อยแล้ว!");
      router.push("/post_pages");
      router.refresh();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "เกิดข้อผิดพลาดในการแชร์การเดินทางของคุณ");
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
            แชร์การเดินทางของคุณ
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
