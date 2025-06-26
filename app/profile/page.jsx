"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { ThemeContext } from "../ThemeContext";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const defaultAvatar = "/D2T2.png";

const Profile = () => {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);

  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ username: "", email: "", avatar: "" });
  const [preview, setPreview] = useState(defaultAvatar);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          avatar: parsedUser.avatar || "",
        });
        setPreview(parsedUser.avatar || defaultAvatar);
      } else {
        setPreview(defaultAvatar);
      }
    } catch (error) {
      console.error("❌ Error loading user from localStorage:", error);
      setPreview(defaultAvatar);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, [hasMounted]);

  if (!hasMounted) return null; // ป้องกัน SSR hydration mismatch

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const size = 176;
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;

          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");

          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

          const croppedDataUrl = canvas.toDataURL("image/png");

          setPreview(croppedDataUrl);
          setUser((prev) => ({ ...prev, avatar: croppedDataUrl }));
        };
        img.src = reader.result;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    const alertBox = document.createElement("div");
    alertBox.textContent = "✅ ข้อมูลได้รับการบันทึกแล้ว";
    alertBox.style.position = "fixed";
    alertBox.style.top = "30px";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translateX(-50%)";
    alertBox.style.background = "linear-gradient(90deg,#60a5fa,#f472b6)";
    alertBox.style.color = "#fff";
    alertBox.style.padding = "16px 32px";
    alertBox.style.borderRadius = "16px";
    alertBox.style.fontSize = "1.1rem";
    alertBox.style.boxShadow = "0 4px 24px rgba(0,0,0,0.12)";
    alertBox.style.zIndex = "9999";
    document.body.appendChild(alertBox);
    setTimeout(() => {
      alertBox.remove();
    }, 1000);
  };

return (
    <div
        className={`min-h-screen flex flex-col transition-colors duration-500 ${
            darkMode
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
                : "bg-gradient-to-br from-blue-100 via-pink-100 to-white text-black"
        }`}
    >
        <Navbar />

        <main className="flex flex-1 mt-14 items-center justify-center py-8">
            <motion.div
                className={`w-full max-w-2xl p-4 rounded-3xl shadow-2xl border-2 transition-colors duration-500 ${
                    darkMode
                        ? "bg-black/80 border-pink-400"
                        : "bg-white/80 border-blue-400"
                }`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1
                    className={`text-4xl font-extrabold text-center mb-8 bg-gradient-to-r ${
                        darkMode
                            ? "from-pink-400 to-blue-400"
                            : "from-blue-400 to-pink-400"
                    } text-transparent bg-clip-text drop-shadow`}
                >
                    แก้ไขข้อมูลส่วนตัว
                </h1>

                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.08, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 180 }}
                        className="relative"
                    >
                        <motion.div
                            key={preview}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative"
                        >
                            <Image
                                src={preview || defaultAvatar}
                                alt={user.username || "avatar"}
                                width={176}
                                height={176}
                                priority
                                className={`rounded-full object-cover border-4 shadow-xl transition-colors duration-500 ${
                                    darkMode ? "border-pink-400" : "border-blue-400"
                                }`}
                            />
                        </motion.div>

                        <label
                            htmlFor="avatar"
                            className={`absolute bottom-2 right-2 bg-gradient-to-r ${
                                darkMode
                                    ? "from-pink-400 to-blue-400"
                                    : "from-blue-400 to-pink-400"
                            } text-white px-3 py-1.5 rounded-full cursor-pointer font-semibold shadow hover:from-pink-400 hover:to-orange-400 transition text-sm`}
                        >
                            เปลี่ยนรูป
                        </label>
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <InputField
                        label="ชื่อผู้ใช้"
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                        icon={
                            <svg
                                className={`w-5 h-5 ${
                                    darkMode ? "text-pink-400" : "text-blue-400"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z"
                                />
                            </svg>
                        }
                    />
                    <InputField
                        label="อีเมล"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        icon={
                            <svg
                                className={`w-5 h-5 ${
                                    darkMode ? "text-pink-400" : "text-blue-400"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1"
                                />
                            </svg>
                        }
                    />
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className={`mt-8 w-full bg-gradient-to-r font-bold py-3 rounded-xl shadow-lg transition text-lg ${
                        darkMode
                            ? "from-pink-400 to-blue-400 hover:from-blue-400 hover:to-pink-400"
                            : "from-blue-400 to-pink-400 hover:from-pink-400 hover:to-orange-400"
                    } text-white`}
                >
                    บันทึกการเปลี่ยนแปลง
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className={`mt-4 w-full font-semibold py-3 rounded-xl transition ${
                        darkMode
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                >
                    ย้อนกลับ
                </motion.button>
            </motion.div>
        </main>
        <Footer />
    </div>
);
};

const InputField = ({ label, name, value, onChange, icon }) => (
  <div>
    <label className="block mb-2 font-semibold text-lg">{label}</label>
    <div className="flex items-center bg-white text-black border-2 border-blue-200 dark:border-pink-400 rounded-xl shadow px-3 py-2">
      {icon && <span className="mr-2">{icon}</span>}
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent outline-none text-lg"
        autoComplete="off"
      />
    </div>
  </div>
);

export default Profile;
