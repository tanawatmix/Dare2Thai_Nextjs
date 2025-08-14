"use client";

import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../ThemeContext";
import bp from "../../public/bp.jpg";
import wp from "../../public/whiteWater.jpg";

const mockUsers = [
  { id: 1, username: "user1", email: "user1@mail.com", password: "pass1" },
  { id: 2, username: "user2", email: "user2@mail.com", password: "pass2" },
  { id: 3, username: "user3", email: "user3@mail.com", password: "pass3" },
  { id: 999, username: "admin", email: "admin@mail.com", password: "admin123" }, // admin user
];


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
    fillAll: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
    enMail: "กรอกอีเมล",
    enPass: "กรอกรหัสผ่าน",
    en: "English",
    th: "ไทย",
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
    fillAll: "Please enter both email and password",
    enMail: "Enter your email",
    enPass: "Enter your password",
    en: "English",
    th: "ไทย",
  },
};

const Login = () => {
  const [lang, setLang] = useState("th");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // ดึง context darkMode และ toggleDarkMode มาใช้
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const t = translations[lang];

  const handleLogin = () => {
  if (!email || !password) {
    alert(t.fillAll);
    return;
  }

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify({ id: user.id, username: user.username }));

    setShowSuccess(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  } else {
    alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }
};


  return (
    <div
      className="font-sriracha bg-fixed bg-cover min-h-screen"
      style={{
        backgroundImage: `url(${darkMode ? bp.src : wp.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-black/70 backdrop-blur-lg rounded-3xl shadow-xl p-10 w-full max-w-lg border-2 border-blue-400 dark:border-pink-400 relative"
        >
          {/* Language & Theme Switch */}
          <div className="absolute top-0 right-0 flex gap-2 p-4 z-10">
            <button
              className="text-xs font-semibold py-1 px-4 rounded-full border border-blue-400 dark:border-pink-400 bg-white/80 dark:bg-gray-800/80 text-blue-600 dark:text-pink-400 hover:bg-blue-100 dark:hover:bg-pink-900 transition"
              onClick={() => setLang(lang === "th" ? "en" : "th")}
              aria-label="Switch Language"
            >
              {lang === "th" ? "EN" : "ไทย"}
            </button>
            <button
              onClick={toggleDarkMode}
              className="text-xs font-semibold py-1 px-4 rounded-full border border-blue-400 dark:border-pink-400 bg-white/80 dark:bg-gray-800/80 text-blue-600 dark:text-pink-400 hover:bg-blue-100 dark:hover:bg-pink-900 transition"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? "Light ☀️" : "Dark 🌙"}
            </button>
          </div>

          <h1 className="text-4xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
            {t.title}
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
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
            />
            <InputField
              id="password"
              label={t.password}
              placeholder={t.enPass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white font-bold py-3 rounded-lg hover:from-pink-400 hover:to-orange-400 transition"
              type="submit"
            >
              {t.login}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-gray-700 dark:text-gray-200 text-base">
            {t.noAccount}{" "}
            <span
              className="font-extrabold text-pink-500 cursor-pointer hover:text-orange-400 transition"
              onClick={() => (window.location.href = "/register")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && (window.location.href = "/register")}
            >
              {t.register}
            </span>
          </p>
        </motion.div>

        {/* Success Notification */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 border-2 border-white text-white font-bold px-10 py-5 rounded-2xl shadow-2xl text-center z-50"
            >
              {t.success}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1 }}
                className="h-1 bg-white mt-3 rounded-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function InputField({ id, label, placeholder, type, value, onChange }) {
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
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border-2 border-blue-200 dark:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-pink-400 dark:bg-white text-black transition text-lg shadow"
        required
      />
    </div>
  );
}

export default Login;
