"use client";

import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../ThemeContext";
import bp from "../../public/bp.jpg";
import wp from "../../public/whiteWater.jpg";
import proDefault from "../../public/dare2New.png";

const translations = {
  th: {
    title: "ลงทะเบียน",
    email: "อีเมล",
    password: "รหัสผ่าน",
    username: "ชื่อผู้ใช้",
    conpassword: "ยืนยันรหัสผ่าน",
    login: "ลงทะเบียน",
    haveAccount: "มีบัญชีแล้ว?",
    register: "เข้าสู่ระบบ",
    home: "หน้าแรก",
    success: "✅ ลงทะเบียนสำเร็จ!",
    fillAll: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
    passMismatch: "รหัสผ่านไม่ตรงกัน",
    enUserN: "กรอกชื่อผู้ใช้",
    enPass: "กรอกรหัสผ่าน",
    enMail: "กรอกอีเมล",
    enConPass: "ยืนยันรหัสผ่านของคุณ",
    Optional: "ไม่จำเป็น",
    selectAvatar: "เลือกรูปโปรไฟล์",
    changAvatar: "เปลี่ยนรูปโปรไฟล์",
    en: "English",
    th: "ไทย",
  },
  en: {
    title: "Register",
    email: "Email",
    password: "Password",
    username: "Username",
    conpassword: "Confirm Password",
    login: "Register",
    haveAccount: "Already have an account?",
    register: "Login",
    home: "Home",
    success: "✅ Registration successful!",
    fillAll: "Please fill in all fields.",
    passMismatch: "Passwords do not match",
    enUserN: "Enter your username",
    enPass: "Enter your password",
    enMail: "Enter your email",
    enConPass: "Confirm your password",
    Optional: "Optional",
    selectAvatar: "Select Profile Picture",
    changAvatar: "Change Profile Picture",
    en: "English",
    th: "ไทย",
  },
};

const Register = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [lang, setLang] = useState("th");
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const t = translations[lang];

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarPreview(imageUrl);
    }
  };

  const handleRegister = () => {
    if (!email || !username || !password || !confirmPassword) {
      alert(t.fillAll);
      return;
    }
    if (password !== confirmPassword) {
      alert(t.passMismatch);
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <div
      className="font-sriracha bg-fixed bg-cover min-h-screen"
      style={{
        backgroundImage: `url(${darkMode ? bp : wp})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="border-2 bg-black/70 border-blue-400 dark:border-pink-400 rounded-3xl shadow-2xl p-10 max-w-4xl w-full relative backdrop-blur-lg flex flex-col md:flex-row gap-10"
        >
          {/* Left: Avatar & Controls */}
          <div className="flex-1 flex flex-col justify-center items-center gap-8 border-r-0 md:border-r md:pr-10 border-blue-400">
            {/* Language & Theme */}
            <div className="absolute top-0 right-0 flex flex-col items-end gap-2 z-10 p-3">
              <button
                className="text-xs font-semibold py-1 px-4 rounded-full border border-blue-400 dark:border-pink-400 bg-white/90 dark:bg-gray-900/80 text-blue-600 dark:text-pink-400 hover:bg-blue-100 dark:hover:bg-pink-900 transition"
                onClick={() => setLang(lang === "th" ? "en" : "th")}
                aria-label="Switch language"
              >
                {lang === "th" ? "EN" : "ไทย"}
              </button>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 text-xs font-semibold py-1 px-4 rounded-full border border-blue-400 dark:border-pink-400 bg-white/90 dark:bg-gray-900/80 text-blue-600 dark:text-pink-400 hover:bg-blue-100 dark:hover:bg-pink-900 transition"
              >
                {darkMode ? (
                  <>
                    <span>Light</span>
                    <span role="img" aria-label="Light mode">
                      ☀️
                    </span>
                  </>
                ) : (
                  <>
                    <span>Dark</span>
                    <span role="img" aria-label="Dark mode">
                      🌙
                    </span>
                  </>
                )}
              </button>
            </div>

            <button
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold p-3 rounded-full transition duration-200 w-24 shadow-lg hover:scale-110"
              onClick={() => (window.location.href = "/")}
            >
              {t.home}
            </button>

            <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 mb-8 text-center drop-shadow-lg">
              {t.title}
            </h3>

            <div className="flex items-center justify-center mb-2">
              <motion.img
                src={avatarPreview || proDefault.src} // ใส่ path รูป default
                alt="Avatar Preview"
                className="w-44 h-44 rounded-3xl border-4 border-blue-400 dark:border-pink-400 object-cover shadow-xl"
                whileHover={{ scale: 1.07, rotate: 2 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            </div>

            <div className="mb-2">
              <label
                htmlFor="avatar-upload"
                className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:from-pink-400 hover:to-orange-400 transition font-semibold shadow"
              >
                {t.selectAvatar}
              </label>
              <input
                type="file"
                accept="image/*"
                id="avatar-upload"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200">
              {t.Optional}
            </h3>
          </div>

          {/* Right: Register Form */}
          <div className="flex-1 mt-5 relative flex flex-col justify-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              className="space-y-6"
            >
              <InputField
                id="email"
                label={t.email}
                placeholder={t.enMail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <InputField
                id="UserName"
                label={t.username}
                placeholder={t.enUserN}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <InputField
                id="password"
                label={t.password}
                placeholder={t.enPass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <InputField
                id="ConfirmPassword"
                label={t.conpassword}
                placeholder={t.enConPass}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold p-3 rounded-lg hover:from-pink-400 hover:to-orange-400 w-full shadow-lg transition duration-300 text-lg"
                type="submit"
              >
                {t.login}
              </motion.button>
            </form>
            <p className="mt-6 text-center text-gray-700 dark:text-gray-200 text-base">
              {t.haveAccount}{" "}
              <span
                className="font-extrabold text-pink-500 cursor-pointer hover:text-orange-400 transition"
                onClick={() => (window.location.href = "/login")}
              >
                {t.register}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Success Notification */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 border-2 border-dashed border-white text-white font-bold px-10 py-5 rounded-2xl shadow-2xl text-center z-50"
            >
              {t.success}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "linear" }}
                className="h-1 bg-white mt-3 rounded-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Reusable Input Field Component
function InputField({
  id,
  label,
  placeholder,
  type,
  value,
  onChange,
  required,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 font-semibold text-gray-700 dark:text-gray-200"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        className="w-full p-3 border-2 border-blue-200 dark:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-pink-400 bg-white/90 dark:bg-gray-900/80 transition text-lg shadow"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

export default Register;
