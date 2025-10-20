"use client";

import { useState, useEffect, ChangeEvent, useContext } from "react";
import { useRouter } from "next/navigation";
import { ThemeContext } from "../ThemeContext";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import PostCard from "../components/PostCard";
import Swal from "sweetalert2";

const defaultAvatar = "/D2T2.png";

type ProfileData = {
  id: string;
  name: string;
  username: string;
  profile_image: string;
  role?: string;
};

type PostData = {
  id: string;
  user_id: string; // ต้องมี user_id
  title: string;
  description: string;
  place_type: string;
  province: string;
  image_url: string[] | string | null;
};

const ProfilePage = () => {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(defaultAvatar);
  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // ดึง Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData || null);
      setAvatarPreview(profileData?.profile_image || defaultAvatar);

      // ดึงโพสต์
      const { data: postData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        Swal.fire("Error", "โหลดโพสต์ไม่สำเร็จ", "error");
      } else if (postData) {
        const formatted = postData.map((p) => ({
          ...p,
          image_url:
            typeof p.image_url === "string"
              ? (() => {
                  try {
                    return JSON.parse(p.image_url);
                  } catch {
                    return [p.image_url];
                  }
                })()
              : p.image_url || [],
        }));
        setPosts(formatted);
      }

      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);

    let avatarUrl = profile.profile_image;

    if (avatarFile) {
      if (profile.profile_image) {
        const oldFileName = profile.profile_image.split("/").pop();
        if (oldFileName) {
          const oldFilePath = `public/${profile.id}/${oldFileName}`;
          await supabase.storage.from("avatars").remove([oldFilePath]);
        }
      }

      const newFileName = `${Date.now()}_${avatarFile.name}`;
      const newFilePath = `public/${user.id}/${newFileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(newFilePath, avatarFile);

      if (uploadError) {
        console.error(uploadError);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadData.path);
      avatarUrl = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        username: profile.username,
        profile_image: avatarUrl,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
    } else {
      Swal.fire("บันทึกสำเร็จ", "ข้อมูลโปรไฟล์ได้รับการอัปเดตแล้ว", "success");
    }

    setSaving(false);
  };

  const handleDeletePost = async (postId: string) => {
    const confirm = await Swal.fire({
      title: "ลบโพสต์นี้?",
      text: "การลบไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
    });

    if (!confirm.isConfirmed) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      Swal.fire("Error", "ลบโพสต์ไม่สำเร็จ", "error");
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      Swal.fire("Deleted!", "โพสต์ถูกลบแล้ว", "success");
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    const { value: formValues } = await Swal.fire({
      title: "เปลี่ยนรหัสผ่าน",
      html:
        '<input id="current-password" type="password" class="swal2-input" placeholder="รหัสผ่านปัจจุบัน">' +
        '<input id="new-password" type="password" class="swal2-input" placeholder="รหัสผ่านใหม่">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      preConfirm: () => {
        const current = (
          document.getElementById("current-password") as HTMLInputElement
        ).value;
        const newPass = (
          document.getElementById("new-password") as HTMLInputElement
        ).value;
        if (!current || !newPass) {
          Swal.showValidationMessage("กรุณากรอกทั้งรหัสปัจจุบันและใหม่");
          return null;
        }
        return { current, newPass };
      },
    });

    if (!formValues) return;

    const confirm = await Swal.fire({
      title: "ยืนยันการเปลี่ยนรหัสผ่าน?",
      text: "รหัสผ่านใหม่จะเปลี่ยนทันที",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, เปลี่ยนเลย",
    });

    if (!confirm.isConfirmed) return;

    try {
      const { error } = await supabase.auth.updateUser({
        password: formValues.newPass,
      });
      if (error) {
        Swal.fire("Error", error.message, "error");
      } else {
        Swal.fire({
          title: "เปลี่ยนรหัสผ่านสำเร็จ",
          html: `รหัสผ่านใหม่ของคุณคือ: <strong>${formValues.newPass}</strong>`,
          icon: "success",
        });
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "เกิดข้อผิดพลาด", "error");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );

  return (
    // ✅ FIX: ใช้ CSS Variables และลบ font-sriracha
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 bg-[var(--background)] text-[var(--foreground)]`}
    >
      <Navbar />
      <main className="flex flex-1 mt-14 flex-col items-center py-8 px-4">
        {/* Profile Form */}
        <motion.div
          // ✅ FIX: ปรับสีพื้นหลังการ์ดให้ตัดกับ Body
          className={`w-full max-w-2xl p-8 rounded-3xl shadow-2xl border-2 ${
            darkMode
              ? "bg-gray-800/80 border-pink-400"
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
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 180 }}
              className="relative"
            >
              <Image
                src={avatarPreview}
                alt={profile?.username || "avatar"}
                width={176}
                height={176}
                priority
                className={`rounded-full object-cover border-4 shadow-xl ${
                  darkMode ? "border-pink-400" : "border-blue-400"
                }`}
              />
              <label
                htmlFor="avatar"
                className={`absolute bottom-2 right-2 bg-gradient-to-r ${
                  darkMode
                    ? "from-pink-400 to-blue-400"
                    : "from-blue-400 to-pink-400"
                } text-white px-3 py-1.5 rounded-full cursor-pointer font-semibold shadow text-sm`}
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
              label="ชื่อ"
              name="name"
              value={profile?.name || ""}
              onChange={handleChange}
              darkMode={darkMode} // ส่ง prop darkMode ไป
            />
            <InputField
              label="ชื่อผู้ใช้"
              name="username"
              value={profile?.username || ""}
              onChange={handleChange}
              darkMode={darkMode} // ส่ง prop darkMode ไป
            />
            <InputField
              label="อีเมล"
              name="email"
              value={user?.email || ""}
              onChange={() => {}}
              readOnly
              darkMode={darkMode} // ส่ง prop darkMode ไป
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleChangePassword}
            className="mt-4 w-full font-semibold py-3 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 transition"
          >
            เปลี่ยนรหัสผ่าน
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className={`mt-8 w-full bg-gradient-to-r font-bold py-3 rounded-xl shadow-lg transition text-lg ${
              darkMode
                ? "from-pink-400 to-blue-400"
                : "from-blue-400 to-pink-400"
            } text-white disabled:opacity-50`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </motion.button>
        </motion.div>

        {/* Posts */}
        <div className="mt-12 w-full max-w-3xl">
          {/* ✅ FIX: ใช้สีข้อความจาก CSS Variable */}
          <h2 className="text-2xl font-bold mb-4 text-center text-[var(--foreground)]">โพสต์ของฉัน</h2>
          {posts.length === 0 ? (
            <p className="text-center text-gray-500">ยังไม่มีโพสต์ของคุณ</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map(
                (post) =>
                  post.user_id && (
                    <PostCard
                      key={post.id}
                      postId={post.id}
                      title={post.title}
                      description={post.description}
                      type={post.place_type}
                      province={post.province || "-"}
                      images={post.image_url as string[]}
                      onDelete={handleDeletePost}
                      onFav={() => {}}
                      // ownerId={post.user_id} // ไม่มี props นี้ใน PostCard
                      // currentUserId={user?.id} // ไม่มี props นี้ใน PostCard
                    />
                  )
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// --- InputField Sub-component (แก้ไข) ---
const InputField = ({
  label,
  name,
  value,
  onChange,
  readOnly = false,
  darkMode, // รับ prop darkMode
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  darkMode: boolean; // กำหนด Type
}) => (
  <div>
    {/* ✅ FIX: ใช้สีข้อความจาก CSS Variable */}
    <label className="block mb-2 font-semibold text-lg text-[var(--foreground)] opacity-90">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      // ✅ FIX: ปรับสี Input Field ให้เข้ากับธีม
      className={`w-full text-lg px-4 py-2 rounded-xl border-2 transition
        ${readOnly
            ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" // สีสำหรับ readOnly
            : "bg-white dark:bg-gray-700 text-black dark:text-white" // สีสำหรับปกติ
        }
        ${darkMode ? "border-pink-400 focus:border-pink-300" : "border-blue-300 focus:border-blue-500"}
        focus:ring-2 ${darkMode ? "focus:ring-pink-300" : "focus:ring-blue-300"} focus:outline-none
      `}
      autoComplete="off"
    />
  </div>
);

export default ProfilePage;