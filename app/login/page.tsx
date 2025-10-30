"use client";

import React, { useState, useContext, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../ThemeContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
// 1. Import icons ที่จำเป็น
import { FiMail, FiLock, FiSun, FiMoon } from "react-icons/fi";

// Type สำหรับภาษา
type Lang = "th" | "en";

// Object สำหรับเก็บคำแปล
const translations = {
  th: {
    title: "เข้าสู่ระบบ",
    email: "อีเมล",
    password: "รหัสผ่าน",
    login: "เข้าสู่ระบบ",
    noAccount: "ยังไม่มีบัญชี?",
    register: "ลงทะเบียน",
    home: "หน้าแรก",
    success: "✅ เข้าสู่ระบบสำเร็จ!",
    fillAll: "กรุณากรอกอีเมลและรหัสผ่าน",
    enPass: "กรอกรหัสผ่าน",
    enMail: "กรอกอีเมล",
  },
  en: {
    title: "Login",
    email: "Email",
    password: "Password",
    login: "Login",
    noAccount: "Don't have an account?",
    register: "Register",
    home: "Home",
    success: "✅ Login successful!",
    fillAll: "Please enter email and password",
    enPass: "Enter your password",
    enMail: "Enter your email",
  },
};

// --- 2. คัดลอก InputField Component มาจากหน้า Register ---
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
        className="w-full p-3 pl-10 border-2 border-blue-200 bg-gray-300 dark:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-white text-black transition"
        required
      />
    </div>
  </motion.div>
);

// --- Main Login Component ---
const Login: React.FC = () => {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [lang, setLang] = useState<Lang>("th");
  const t = translations[lang];

  // --- States for form fields ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- States for UI feedback ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError(t.fillAll);
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: email,
        password: password,
      }
    );

    if (signInError) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else if (data.session) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh(); // สั่งให้ refresh เพื่อให้ Navbar อัปเดต
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div
      className={`relative min-h-screen transition duration-500 overflow-x-hidden ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative border-2 bg-black/70 border-blue-400 dark:border-pink-400 rounded-3xl shadow-2xl p-10 max-w-lg w-full backdrop-blur-lg"
        >
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
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 mb-8"
          >
            {t.title}
          </motion.h3>
          <form onSubmit={handleLogin} className="space-y-6">
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
            </motion.div>

            {error && (
              <p className="text-red-500 text-center text-sm pt-2">{error}</p>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold p-3 rounded-lg hover:from-pink-400 hover:to-orange-400 w-full shadow-lg disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : t.login}
            </motion.button>
          </form>
          <p className="mt-6 text-sm text-center text-gray-300">
            {t.noAccount}{" "}
            <span
              className="text-pink-400 font-bold cursor-pointer hover:text-orange-300"
              onClick={() => router.push("/register")}
            >
              {t.register}
            </span>
          </p>
          <div className="flex justify-center mt-6">
            <Link
              href="/post_pages"
              className="text-xl font-semibold py-1 px-5 rounded-full border hover:scale-105 transition duration-200 border-blue-400 dark:border-pink-400 bg-white/80 dark:bg-gray-800/80 text-blue-600 dark:text-pink-400 focus:outline-none inline-flex items-center justify-center"
            >
              {t.home}
            </Link>
          </div>
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
    </div>
  );
};

export default Login;
