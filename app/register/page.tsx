"use client";

import React, {
  useState,
  useRef,
  useContext,
  ChangeEvent,
  FormEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../ThemeContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import proDefault from "../../public/dare2New.png";
import { FiMail, FiLock, FiUser, FiSun, FiMoon } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const translations = {
  th: {
    title: "ลงทะเบียน",
    email: "อีเมล",
    password: "รหัสผ่าน",
    // username: "ชื่อผู้ใช้", // ลบออก
    name: "ชื่อ-นามสกุล",
    conpassword: "ยืนยันรหัสผ่าน",
    login: "ลงทะเบียน",
    haveAccount: "มีบัญชีแล้ว?",
    register: "เข้าสู่ระบบ",
    home: "หน้าแรก",
    success: "✅ ลงทะเบียนสำเร็จ!",
    fillAll: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
    passMismatch: "รหัสผ่านไม่ตรงกัน",
    // enUserN: "กรอกชื่อผู้ใช้", // ลบออก
    enPass: "กรอกรหัสผ่าน",
    enMail: "กรอกอีเมล",
    enConPass: "ยืนยันรหัสผ่านของคุณ",
    Optional: "ไม่จำเป็น",
    selectAvatar: "เลือกรูปโปรไฟล์",
    changAvatar: "เปลี่ยนรูปโปรไฟล์",
    en: "English",
    th: "ไทย",
    cropTitle: "ตัดรูปโปรไฟล์",
    cropConfirm: "ยืนยัน",
    cropCancel: "ยกเลิก",
  },
  en: {
    title: "Register",
    email: "Email",
    password: "Password",
    // username: "Username", // ลบออก
    name: "Full Name",
    conpassword: "Confirm Password",
    login: "Register",
    haveAccount: "Already have an account?",
    register: "Login",
    home: "Home",
    success: "✅ Registration successful!",
    fillAll: "Please fill in all fields.",
    passMismatch: "Passwords do not match",
    // enUserN: "Enter your username", // ลบออก
    enPass: "Enter your password",
    enMail: "Enter your email",
    enConPass: "Confirm your password",
    Optional: "Optional",
    selectAvatar: "Select Profile Picture",
    changAvatar: "Change Profile Picture",
    en: "English",
    th: "ไทย",
    cropTitle: "Crop Profile Picture",
    cropConfirm: "Confirm",
    cropCancel: "Cancel",
  },
};

function generateUsernameFromEmail(email: string): string {
  if (!email) return `user_${Math.floor(1000 + Math.random() * 9000)}`;

  let prefix = email.split("@")[0];
  prefix = prefix
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/__+/g, "_")
    .replace(/_+$/g, "");

  if (prefix.length < 3) {
    prefix = `user_${prefix}`;
  }
  if (prefix.length === 0) {
    prefix = "user";
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}_${randomSuffix}`;
}

function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return Promise.reject(new Error("Failed to get canvas context"));
  }

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      0.95 // คุณภาพ 95%
    );
  });
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90, // เริ่มต้นที่ 90%
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

// --- InputField Sub-component ---
type InputFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
};
const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  placeholder,
  type,
  value,
  onChange,
  icon,
}) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
  >
    <label
      htmlFor={id}
      className="block mb-2 text-sm font-medium text-gray-300"
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
        {icon}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 pl-10 border-2 border-blue-200 dark:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-gray-300 text-black transition"
        required
      />
    </div>
  </motion.div>
);

const Register: React.FC = () => {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [lang, setLang] = useState<"th" | "en">("th");
  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [username, setUsername] = useState(""); // ลบออก
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null); // เพิ่ม ref สำหรับ input file

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ลบ !username ออกจากการตรวจสอบ
    if (!email || !password || !name || !confirmPassword) {
      setError(t.fillAll);
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passMismatch);
      setLoading(false);
      return;
    }

    // สร้าง username อัตโนมัติจากอีเมล
    const newUsername = generateUsernameFromEmail(email);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          username: newUsername, // ใช้ username ที่สร้างอัตโนมัติ
          profile_image: avatarPreview,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setShowSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCrop(undefined);
    setCompletedCrop(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1 / 1));
  }

  const handleCropCancel = () => {
    setOriginalImageSrc(null);
    // เคลียร์ค่าใน input file เพื่อให้เลือกไฟล์เดิมได้อีก
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleCropConfirm = async () => {
    if (!completedCrop || !imgRef.current) {
      setError("กรุณาเลือกพื้นที่ก่อน");
      return;
    }

    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
      setLoading(true);
      setOriginalImageSrc(null);

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(`public/${Date.now()}_${croppedFile.name}`, croppedFile);

      if (error) {
        throw new Error("เกิดข้อผิดพลาดในการอัปโหลดรูป");
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);
      setAvatarPreview(urlData.publicUrl);
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false); // หยุดหมุน
      // เคลียร์ค่าใน input file
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  // ⭐️⭐️⭐️ แก้ไขส่วนนี้ ⭐️⭐️⭐️
  const handleGoogleLogin = async () => {
    // ใช้วิธีนี้แทนเพื่อความยืดหยุ่น (ทำงานได้ทั้ง localhost, production, Vercel previews)
    const redirectTo = `${window.location.origin}/post_pages`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo, // ใช้ URL ที่สร้างแบบ dynamic
      },
    });

    if (error) {
      console.error("Google login error:", error);
      setError("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
    }
  };
  // ⭐️⭐️⭐️ สิ้นสุดส่วนแก้ไข ⭐️⭐️⭐️

  return (
    <div
      className={`relative min-h-screen transition duration-500 overflow-x-hidden font-sriracha ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative border-2 bg-black/70 border-blue-400 dark:border-pink-400 rounded-3xl shadow-2xl p-8 max-w-4xl w-full backdrop-blur-lg flex flex-col md:flex-row gap-8"
        >
          {/* Top-Right Control Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <select
              onChange={(e) => setLang(e.target.value as "th" | "en")}
              value={lang}
              className="text-xs font-semibold py-1 px-2 rounded-full border border-blue-400 dark:border-pink-400 bg-white/80 dark:bg-gray-800/80 text-blue-600 dark:text-pink-400 focus:outline-none"
            >
              <option value="th">🇹🇭 ไทย</option>
              <option value="en">en ENGLISH</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="text-xl p-1.5 rounded-full border border-blue-400 dark:border-pink-400 bg-white/80 dark:bg-gray-800/80 text-blue-600 dark:text-pink-400"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </motion.button>
          </div>

          {/* Left Avatar Section */}
          <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center border-b-2 md:border-b-0 md:border-r-2 pb-8 md:pb-0 md:pr-8 border-blue-400/50 dark:border-pink-400/50">
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 mb-4"
            >
              {t.title}
            </motion.h3>

            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative"
            >
              <img
                src={avatarPreview || proDefault.src}
                alt="Avatar Preview"
                className="w-40 h-40 rounded-full border-4 border-blue-400 dark:border-pink-400 object-cover shadow-xl"
              />
            </motion.div>

            <label
              htmlFor="avatar-upload"
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-5 py-2.5 rounded-lg cursor-pointer font-semibold shadow-lg hover:from-pink-400 hover:to-orange-400 transition-transform hover:scale-105"
            >
              {avatarPreview ? t.changAvatar : t.selectAvatar}
            </label>
            <input
              type="file"
              accept="image/*"
              id="avatar-upload"
              className="hidden"
              onChange={handleImageSelect}
              ref={imageInputRef} // เพิ่ม ref ที่นี่
            />
            <p className="text-xs text-pink-400">{t.Optional}</p>
            <p className="mt-6 text-sm text-center text-gray-300">
              {t.haveAccount}{" "}
              <span
                className="text-pink-400 font-bold cursor-pointer hover:text-orange-300 transition"
                onClick={() => router.push("/login")}
              >
                {t.register}
              </span>
            </p>
            <div className="flex justify-center mt-1">
              <Link
                href="/post_pages"
                className="text-xl font-semibold py-1 px-5 rounded-full border hover:scale-105 transition duration-200 border-blue-400 dark:border-pink-400 bg-white/80 dark:bg-gray-800/80 text-blue-600 dark:text-pink-400 focus:outline-none inline-flex items-center justify-center"
              >
                {t.home}
              </Link>
            </div>
          </div>

          {/* Right Form Section */}
          <form onSubmit={handleRegister} className="flex-1">
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              <InputField
                id="name"
                label={t.name}
                placeholder={t.name}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<FiUser />}
              />
              
              {/* ⭐️⭐️⭐️ ลบ InputField ของ Username ออก ⭐️⭐️⭐️ */}
              
              <InputField
                id="email"
                label={t.email}
                placeholder={t.enMail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<FiMail />}
              />
              <InputField
                id="password"
                label={t.password}
                placeholder={t.enPass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<FiLock />}
              />
              <InputField
                id="confirmPassword"
                label={t.conpassword}
                placeholder={t.enConPass}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<FiLock />}
              />

              {error && (
                <p className="text-red-400 text-center text-sm pt-2">{error}</p>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold text-lg p-3 mt-4 rounded-lg hover:from-pink-500 hover:to-orange-400 shadow-lg transition-all disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? lang === "th"
                    ? "กำลังดำเนินการ..."
                    : "Loading..."
                  : lang === "th"
                  ? "สมัครสมาชิก"
                  : "Sign up"}
              </motion.button>
            </motion.div>

            {/* Divider */}
            <div className="flex items-center my-2">
              <hr className="flex-1 border-gray-400" />
              <span className="mx-3 text-gray-400 text-sm">or</span>
              <hr className="flex-1 border-gray-400" />
            </div>

            {/* 🔹 ปุ่ม Google Login */}
            <div className="flex flex-col items-center justify-center w-full">
              <button
                type="button" // ⭐️ เพิ่ม type="button" กันฟอร์ม submit
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center w-full bg-white text-gray-700 font-semibold py-3 px-5 rounded-lg shadow hover:shadow-lg transition-all"
              >
                <FcGoogle className="mr-3 text-2xl" />

                {loading
                  ? lang === "th"
                    ? "กำลังดำเนินการ..."
                    : "Loading..."
                  : lang === "th"
                  ? "สมัครสมาชิกด้วย Google"
                  : "Sign up with Google"}
              </button>

              {/* ⭐️ ย้าย error มาไว้ด้านล่างปุ่ม Google
                  (แต่ error state นี้จะถูกแชร์กัน,
                  ซึ่ง handleGoogleLogin จะ set error ถ้ามีปัญหา)
              */}
              
            </div>
          </form>
        </motion.div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="absolute top-10 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-10 py-5 rounded-xl shadow-xl"
            >
              {t.success}
              <motion.div
                className="h-1 bg-white mt-3 rounded"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {originalImageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`p-6 rounded-2xl shadow-xl w-full max-w-md ${
                darkMode ? "bg-gray-900 border border-pink-400" : "bg-white"
              }`}
            >
              <h3 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                {t.cropTitle}
              </h3>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1} // --- บังคับสี่เหลี่ยมจัตุรัส ---
                className="w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={originalImageSrc}
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCropCancel}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    darkMode
                      ? "bg-gray-600 text-gray-100 hover:bg-gray-500"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {t.cropCancel}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCropConfirm}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  {t.cropConfirm}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

    export default Register;
