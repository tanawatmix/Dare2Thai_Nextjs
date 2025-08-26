"use client";

import React, { useState, useContext, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../ThemeContext";
import bp from "../../public/bp.jpg";
import wp from "../../public/whiteWater.jpg";
import proDefault from "../../public/dare2New.png";

type Lang = "th" | "en";

type Translations = {
  [key in Lang]: Record<string, string>;
};

const translations: Translations = {
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

const Register: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [lang, setLang] = useState<Lang>("th");
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const t = translations[lang];

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      className={`relative min-h-screen transition duration-500 overflow-x-hidden ${
        darkMode ? "bp text-white" : "wp text-black"
      }`}
    >
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border-2 bg-black/70 border-blue-400 dark:border-pink-400 rounded-3xl shadow-2xl p-10 max-w-4xl w-full backdrop-blur-lg flex flex-col md:flex-row gap-10"
        >
          {/* Left Avatar */}
          <div className="flex-1 flex flex-col justify-center items-center gap-6 border-r-0 md:border-r md:pr-10 border-blue-400">
            <div className="absolute top-0 right-0 flex flex-col items-end gap-2 z-10 p-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-xs font-semibold py-1 px-4 rounded-full border border-blue-400 dark:border-pink-400 bg-white/90 dark:bg-gray-900/80 text-blue-600 dark:text-pink-400"
                onClick={() => setLang(lang === "th" ? "en" : "th")}
              >
                {lang === "th" ? "EN" : "ไทย"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={toggleDarkMode}
                className="text-xs font-semibold py-1 px-4 rounded-full border border-blue-400 dark:border-pink-400 bg-white/90 dark:bg-gray-900/80 text-blue-600 dark:text-pink-400"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold p-3 rounded-full w-24"
              onClick={() => (window.location.href = "/")}
            >
              {t.home}
            </motion.button>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 mb-6"
            >
              {t.title}
            </motion.h3>

            <motion.img
              src={avatarPreview || proDefault.src}
              alt="Avatar Preview"
              className="w-44 h-44 rounded-3xl border-4 border-blue-400 dark:border-pink-400 object-cover shadow-xl"
              whileHover={{ rotate: 2, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            />

            <label
              htmlFor="avatar-upload"
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded-lg cursor-pointer font-semibold shadow hover:from-pink-400 hover:to-orange-400"
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
            <p className="text-xs text-gray-300">{t.Optional}</p>
          </div>

          {/* Right Form */}
          <motion.div
            className="flex-1 space-y-6 mt-5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {[
              {
                id: "email",
                label: t.email,
                placeholder: t.enMail,
                type: "email",
                value: email,
                setValue: setEmail,
              },
              {
                id: "username",
                label: t.username,
                placeholder: t.enUserN,
                type: "text",
                value: username,
                setValue: setUsername,
              },
              {
                id: "password",
                label: t.password,
                placeholder: t.enPass,
                type: "password",
                value: password,
                setValue: setPassword,
              },
              {
                id: "confirmPassword",
                label: t.conpassword,
                placeholder: t.enConPass,
                type: "password",
                value: confirmPassword,
                setValue: setConfirmPassword,
              },
            ].map(({ id, label, placeholder, type, value, setValue }) => (
              <motion.div
                key={id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <label className="block mb-2 text-gray-300">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setValue(e.target.value)
                  }
                  placeholder={placeholder}
                  className="w-full p-3 border-2 border-blue-200 dark:border-pink-400 rounded-xl focus:outline-none dark:bg-white text-black"
                  required
                />
              </motion.div>
            ))}

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold p-3 rounded-lg hover:from-pink-400 hover:to-orange-400 w-full shadow-lg"
              type="submit"
              onClick={handleRegister}
            >
              {t.login}
            </motion.button>
            <p className="text-sm text-center text-gray-300">
              {t.haveAccount}{" "}
              <span
                className="text-pink-400 font-bold cursor-pointer hover:text-orange-300"
                onClick={() => (window.location.href = "/login")}
              >
                {t.register}
              </span>
            </p>
          </motion.div>
        </motion.div>

        {/* ✅ Success message */}
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
    </div>
  );
};

export default Register;
