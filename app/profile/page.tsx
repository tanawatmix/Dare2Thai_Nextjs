"use client";

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  ChangeEvent,
} from "react";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import PostCard from "../components/PostCard";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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
  user_id: string;
  title: string;
  description: string;
  place_type: string;
  province: string;
  image_url: string[] | string | null;
};

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
      0.95
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
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

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

  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData || null);
      setAvatarPreview(profileData?.profile_image || defaultAvatar);

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
      setAvatarFile(null);
      setCrop(undefined);
      setCompletedCrop(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1 / 1));
  }

  const handleCropConfirm = async () => {
    if (!completedCrop || !imgRef.current) {
      Swal.fire("Error", "กรุณาเลือกพื้นที่ก่อน", "error");
      return;
    }

    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
      setAvatarFile(croppedFile);
      setAvatarPreview(URL.createObjectURL(croppedFile));
      setOriginalImageSrc(null);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "เกิดข้อผิดพลาดขณะตัดรูป", "error");
    }
  };

  const handleCropCancel = () => {
    setOriginalImageSrc(null);
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
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar />
      <main className="flex flex-1 mt-14 flex-col items-center py-8 px-4">
        <motion.div
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
              darkMode={darkMode}
            />
            <InputField
              label="ชื่อผู้ใช้"
              name="username"
              value={profile?.username || ""}
              onChange={handleChange}
              darkMode={darkMode}
            />
            <InputField
              label="อีเมล"
              name="email"
              value={user?.email || ""}
              onChange={() => {}}
              readOnly
              darkMode={darkMode}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleChangePassword}
            className="mt-4 w-full font-semibold py-3 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 transition"
          >
            เปลี่ยนรหัสผ่าน
          </motion.button>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className={`flex-1 w-full sm:w-auto font-semibold py-3 rounded-xl transition text-lg ${
                darkMode
                  ? "bg-gray-600 text-gray-100 hover:bg-gray-500"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              กลับ
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 w-full sm:w-auto bg-gradient-to-r font-bold py-3 rounded-xl shadow-lg transition text-lg ${
                darkMode
                  ? "from-pink-400 to-blue-400"
                  : "from-blue-400 to-pink-400"
              } text-white disabled:opacity-50`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </motion.button>
          </div>
        </motion.div>

        <div className="mt-12 w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-center text-[var(--foreground)]">
            โพสต์ของฉัน
          </h2>
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
                      onFav={async (postId: string) => {
                        // TODO: Implement favorite functionality
                      }}
                      ownerId={post.user_id}
                    />
                  )
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

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
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3 className="text-2xl font-bold text-center mb-4">
                ตัดรูปโปรไฟล์
              </h3>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
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
                  className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                >
                  ยกเลิก
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCropConfirm}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  ยืนยันการตัด
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  readOnly = false,
  darkMode,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  darkMode: boolean;
}) => (
  <div>
    <label className="block mb-2 font-semibold text-lg text-[var(--foreground)] opacity-90">
      {label}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${
        darkMode
          ? "bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500"
          : "bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      }`}
      autoComplete="off"
    />
  </div>
);

export default ProfilePage;
