"use client";

import { useState, useEffect, useContext, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ThemeContext } from "../ThemeContext";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabaseClient"; // **1. Import Supabase Client**
import { User } from "@supabase/supabase-js";

const defaultAvatar = "/D2T2.png"; // รูปโปรไฟล์เริ่มต้น

// Type สำหรับข้อมูล Profile จากตาราง public.profiles
type ProfileData = {
  id: string;
  name: string;
  username: string;
  profile_image: string;
  role: string;
};

const Profile = () => {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(defaultAvatar);

  // **2. ดึงข้อมูลผู้ใช้และโปรไฟล์เมื่อเข้าสู่หน้า**
  useEffect(() => {
    const fetchData = async () => {
      // ดึงข้อมูล session ของผู้ใช้ที่ล็อกอินอยู่
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        
        // ใช้ user.id ไปดึงข้อมูลจากตาราง profiles
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setAvatarPreview(profileData.profile_image || defaultAvatar);
        } else {
          console.error("Error fetching profile:", error);
        }
      } else {
        // ถ้าไม่มีใครล็อกอิน ให้กลับไปหน้า login
        router.push('/login');
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  // ฟังก์ชันสำหรับอัปเดต state เมื่อแก้ไขฟอร์ม
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  // **3. แก้ไขฟังก์ชันอัปโหลดรูป**
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file); // เก็บไฟล์ไว้ใน state
      setAvatarPreview(URL.createObjectURL(file)); // สร้าง URL ชั่วคราวเพื่อแสดงผล
    }
  };

  // **4. แก้ไขฟังก์ชันบันทึกข้อมูล**
  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    let updatedProfileData = {
      name: profile.name,
      username: profile.username,
    };
    let avatarUrl = profile.profile_image;

    // --- ตรวจสอบว่ามีการเลือกรูปใหม่หรือไม่ ---
    if (avatarFile) {
      // 1. ลบรูปเก่า (ถ้ามี) เพื่อประหยัดพื้นที่
      if (profile.profile_image) {
        const oldFileName = profile.profile_image.split('/').pop();
        if (oldFileName) {
          // สั่งลบไฟล์จาก path ที่ถูกต้อง
          const oldFilePath = `public/${profile.id}/${oldFileName}`;
          await supabase.storage.from('avatars').remove([oldFilePath]);
        }
      }
      
      // 2. อัปโหลดรูปใหม่
      const newFileName = `${Date.now()}_${avatarFile.name}`;
      const newFilePath = `public/${user.id}/${newFileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(newFilePath, avatarFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setSaving(false);
        return;
      }
      
      // 3. ดึง Public URL ของรูปที่อัปโหลด
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
      avatarUrl = urlData.publicUrl;
    }

    // --- อัปเดตข้อมูลลงตาราง profiles ---
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        ...updatedProfileData,
        profile_image: avatarUrl // อัปเดต URL รูปใหม่
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Save error:", updateError);
    } else {
      showSuccessAlert();
    }
    setSaving(false);
  };

  const showSuccessAlert = () => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white" : "bg-gradient-to-br from-blue-100 via-pink-100 to-white text-black"}`}>
      <Navbar />

      <main className="flex flex-1 mt-14 items-center justify-center py-8 px-4">
        <motion.div
          className={`w-full max-w-2xl p-8 rounded-3xl shadow-2xl border-2 transition-colors duration-500 ${darkMode ? "bg-black/80 border-pink-400" : "bg-white/80 border-blue-400"}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-4xl font-extrabold text-center mb-8 bg-gradient-to-r ${darkMode ? "from-pink-400 to-blue-400" : "from-blue-400 to-pink-400"} text-transparent bg-clip-text drop-shadow`}>
            แก้ไขข้อมูลส่วนตัว
          </h1>

          <div className="flex flex-col items-center mb-8">
            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} transition={{ type: "spring", stiffness: 180 }} className="relative">
              <Image src={avatarPreview} alt={profile?.username || "avatar"} width={176} height={176} priority className={`rounded-full object-cover border-4 shadow-xl transition-colors duration-500 ${darkMode ? "border-pink-400" : "border-blue-400"}`} />
              <label htmlFor="avatar" className={`absolute bottom-2 right-2 bg-gradient-to-r ${darkMode ? "from-pink-400 to-blue-400" : "from-blue-400 to-pink-400"} text-white px-3 py-1.5 rounded-full cursor-pointer font-semibold shadow hover:from-pink-400 hover:to-orange-400 transition text-sm`}>
                เปลี่ยนรูป
              </label>
              <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </motion.div>
          </div>

          <div className="space-y-6">
            <InputField label="ชื่อ" name="name" value={profile?.name || ''} onChange={handleChange} />
            <InputField label="ชื่อผู้ใช้" name="username" value={profile?.username || ''} onChange={handleChange} />
            <InputField label="อีเมล" name="email" value={user?.email || ''} onChange={() => {}} readOnly={true} />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className={`mt-8 w-full bg-gradient-to-r font-bold py-3 rounded-xl shadow-lg transition text-lg ${darkMode ? "from-pink-400 to-blue-400 hover:from-blue-400 hover:to-pink-400" : "from-blue-400 to-pink-400 hover:from-pink-400 hover:to-orange-400"} text-white disabled:opacity-50`}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className={`mt-4 w-full font-semibold py-3 rounded-xl transition ${darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-black hover:bg-gray-300"}`}
          >
            ย้อนกลับ
          </motion.button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

// Component InputField (ปรับปรุงเล็กน้อย)
const InputField = ({ label, name, value, onChange, readOnly = false, icon }: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  icon?: React.ReactNode;
}) => (
  <div>
    <label className="block mb-2 font-semibold text-lg">{label}</label>
    <div className={`flex items-center bg-white text-black border-2 border-blue-200 dark:border-pink-400 rounded-xl shadow px-3 py-2 ${readOnly ? 'bg-gray-200 cursor-not-allowed' : ''}`}>
      {icon && <span className="mr-2">{icon}</span>}
      <input
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="w-full bg-transparent outline-none text-lg"
        autoComplete="off"
      />
    </div>
  </div>
);

export default Profile;