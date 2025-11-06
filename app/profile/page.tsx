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
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import PostCard from "../components/PostCard";

// Crop Imports
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const defaultAvatar = "/dare2New.png";

type ProfileData = {
  id: string;
  name: string;
  username: string;
  profile_image: string;
  role?: string;
};

// --- FIX: Updated PostData type ---
type PostData = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  place_type: string;
  province: string;
  image_url: string[] | string | null;
  created_at: string;
  isFav?: boolean;
  isLiked?: boolean;
  like_count: number;
};

// --- Crop Helper Functions ---
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
  if (!ctx) return Promise.reject(new Error("Failed to get canvas context"));

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
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}
// --- End Crop Helper Functions ---

const ProfilePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(defaultAvatar);
  const [posts, setPosts] = useState<PostData[]>([]);

  // --- States for Cropper ---
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setCurrentUserId(user.id);

      // --- Fetch Profile ---
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData || null);
      setAvatarPreview(profileData?.profile_image || defaultAvatar);

      // --- Fetch Posts ---
      const { data: postData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error(postsError);
        Swal.fire("Error", "โหลดโพสต์ไม่สำเร็จ", "error");
        setLoading(false);
        return;
      }

      if (postData) {
        // --- Fetch Fav, Likes, and Like Counts ---
        let favIds: string[] = [];
        const { data: favData } = await supabase
          .from("favorites")
          .select("post_id")
          .eq("user_id", user.id);
        favIds = favData?.map((f: any) => f.post_id) || [];

        let likedPostIds: string[] = [];
        const { data: likeData } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);
        likedPostIds = likeData?.map((l: any) => l.post_id) || [];

        const postIds = postData.map((p) => p.id);

        let likeCountsMap = new Map<string, number>();
        if (postIds.length > 0) {
          const { data: allLikesData, error: allLikesError } = await supabase
            .from("post_likes")
            .select("post_id")
            .in("post_id", postIds);

          if (allLikesError) {
            console.error(allLikesError);
            toast.error("Error fetching like counts");
          } else if (allLikesData) {
            likeCountsMap = allLikesData.reduce((acc, like) => {
              acc.set(like.post_id, (acc.get(like.post_id) || 0) + 1);
              return acc;
            }, new Map<string, number>());
          }
        }
        // --- End of Fetch ---

        // Format posts
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
          isFav: favIds.includes(p.id),
          isLiked: likedPostIds.includes(p.id),
          like_count: likeCountsMap.get(p.id) || 0,
        }));
        setPosts(formatted as PostData[]);
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

  // --- Image & Crop Handlers ---
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCrop(undefined); // Reset crop
      const reader = new FileReader();
      reader.onloadend = () => setOriginalImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1 / 1));
  };

  const handleCropCancel = () => {
    setOriginalImageSrc(null);
    setAvatarFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

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
    } catch (e: any) {
      console.error("Crop error:", e);
      toast.error("เกิดข้อผิดพลาดขณะตัดรูป");
    }
  };
  // --- End Image & Crop Handlers ---

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    let avatarUrl = profile.profile_image;

    try {
      if (avatarFile) {
        if (profile.profile_image) {
          const oldFileName = profile.profile_image.split("/").pop();
          if (oldFileName && !oldFileName.includes(defaultAvatar)) {
            const oldFilePath = `public/${profile.id}/${oldFileName}`;
            await supabase.storage.from("avatars").remove([oldFilePath]);
          }
        }
        const newFileName = `${Date.now()}_${avatarFile.name}`;
        const newFilePath = `public/${user.id}/${newFileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(newFilePath, avatarFile);

        if (uploadError) throw uploadError;

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

      if (updateError) throw updateError;

      Swal.fire("บันทึกสำเร็จ", "ข้อมูลโปรไฟล์ได้รับการอัปเดตแล้ว", "success");
      setProfile({ ...profile, profile_image: avatarUrl });
      setAvatarFile(null);
    } catch (error: any) {
      console.error("Save profile error:", error);
      Swal.fire("Error", error.message || "ไม่สามารถบันทึกข้อมูล", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const result: void | Error = await toast.promise(
        new Promise<void>((resolve, reject) => {
          import("sweetalert2").then(async (Swal) => {
            const confirmResult = await Swal.default.fire({
              title: "ต้องการลบโพสต์นี้?",
              text: "การกระทำนี้ไม่สามารถย้อนกลับได้!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#3085d6",
              confirmButtonText: "ใช่, ลบเลย!",
              cancelButtonText: "ยกเลิก",
            });
            if (confirmResult.isConfirmed) {
              resolve();
            } else {
              reject(new Error("User cancelled"));
            }
          });
        }),
        {
          loading: "กำลังลบ...",
          success: "ลบโพสต์สำเร็จ!",
          error: (err) =>
            err.message === "User cancelled" ? "ยกเลิกการลบ" : "เกิดข้อผิดพลาด",
        }
      );

      if (
        typeof result === "object" &&
        result !== null &&
        "message" in result
      ) {
        console.log("Deletion cancelled:", (result as Error).message);
        return;
      }

      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw new Error(`ลบโพสต์: ${error.message}`);

      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error: any) {
      if (error.message !== "User cancelled") {
        toast.error(error.message || "เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  const handleFavPost = async (postId: string): Promise<void> => {
    if (!currentUserId) {
      toast.error("กรุณาล็อกอินเพื่อกดถูกใจโพสต์");
      router.push("/login");
      return;
    }
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const isFav = post.isFav;

    try {
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", postId);
        if (error) throw error;
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isFav: false } : p))
        );
        toast.success("ลบโพสต์ออกจากรายการโปรดแล้ว");
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: currentUserId, post_id: postId });
        if (error) throw error;
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isFav: true } : p))
        );
        toast.success("เพิ่มโพสต์เข้าในรายการโปรดแล้ว");
      }
    } catch (err: any) {
      toast.error(err.message);
      // Revert optimistic UI
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isFav: !isFav } : p))
      );
    }
  };

  const handleLikePost = async (
    postId: string,
    newLikedState: boolean
  ): Promise<number> => {
    if (!currentUserId) {
      toast.error("กรุณาล็อกอินเพื่อกดไลค์");
      router.push("/login");
      throw new Error("User not logged in");
    }

    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) throw new Error("Post not found");

    const post = posts[postIndex];
    let newLikeCount = post.like_count;

    try {
      if (newLikedState) {
        const { error } = await supabase.from("post_likes").insert({
          user_id: currentUserId,
          post_id: postId,
        });
        if (error) throw error;
        newLikeCount = post.like_count + 1;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", postId);
        if (error) throw error;
        newLikeCount = Math.max(0, post.like_count - 1);
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: newLikedState, like_count: newLikeCount }
            : p
        )
      );

      return newLikeCount;
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการไลค์");
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !newLikedState, like_count: post.like_count } // Revert
            : p
        )
      );
      throw err;
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    import("sweetalert2").then(async (Swal) => {
      const { value: formValues } = await Swal.default.fire({
        title: t("ChangePass"),
        html:
          '<input id="current-password" type="password" class="swal2-input" placeholder="' + t("Pass") + '">' +
          '<input id="new-password" type="password" class="swal2-input" placeholder="' + t("ConPass") + '">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: t("save"),
        cancelButtonText: t("back"),
        preConfirm: () => {
          const current = (
            document.getElementById("current-password") as HTMLInputElement
          ).value;
          const newPass = (
            document.getElementById("new-password") as HTMLInputElement
          ).value;
          if (!newPass) {
            Swal.default.showValidationMessage("กรุณากรอกรหัสผ่านใหม่");
            return null;
          }
          if (newPass.length < 6) {
            Swal.default.showValidationMessage(
              "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"
            );
            return null;
          }
          return { current, newPass };
        },
      });

      if (!formValues) return;

      try {
        const { error } = await supabase.auth.updateUser({
          password: formValues.newPass,
        });
        if (error) {
          Swal.default.fire("Error", error.message, "error");
        } else {
          Swal.default.fire({
            title: "เปลี่ยนรหัสผ่านสำเร็จ",
            text: "โปรดใช้รหัสผ่านใหม่ในการล็อกอินครั้งถัดไป",
            icon: "success",
          });
        }
      } catch (err: any) {
        Swal.default.fire("Error", err.message || "เกิดข้อผิดพลาด", "error");
      }
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 dark:border-pink-400"></div>
      </div>
    );

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster position="top-right" />
      <Navbar />
      <main className="flex flex-1 mt-14 flex-col items-center py-8 px-4">
        {/* Profile Form */}
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
            {t("YourProfile")}
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
                {t("ChangAvatar")}
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                ref={imageInputRef}
              />
            </motion.div>
          </div>

          <div className="space-y-6">
            <InputField
              label={t("Name")}
              name="name"
              value={profile?.name || ""}
              onChange={handleChange}
              darkMode={darkMode}
            />
            <InputField
              label={t("Email")}
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
            {t("ChangePass")}
          </motion.button>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className={`flex-1 w-full sm:w-auto font-semibold py-3 rounded-xl transition text-lg ${
                darkMode
                  ? "bg-gray-600 text-gray-100 hover:bg-gray-500"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {t("back")}
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
              {t("saveChanges")}
            </motion.button>
          </div>
        </motion.div>

        {/* Posts */}
        <div className="mt-12 w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-center text-[var(--foreground)]">
            {t("MyPost")}
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
                      onFav={handleFavPost}
                      onLike={handleLikePost}
                      ownerId={post.user_id}
                      currentUserId={user?.id}
                      isFav={post.isFav}
                      isLiked={post.isLiked}
                      likeCount={post.like_count || 0}
                    />
                  )
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* --- Crop Modal --- */}
      <AnimatePresence>
        {originalImageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={handleCropCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`p-6 rounded-2xl shadow-xl w-full max-w-md ${
                darkMode ? "bg-gray-900 border border-pink-400" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                {t("editProfile")}
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
                  alt="Crop preview"
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
                  {t("back")}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCropConfirm}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  {t("save")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className={`w-full text-lg px-4 py-2 rounded-xl border-2 transition
        ${
          darkMode
            ? "bg-gray-700 border-gray-600 text-white focus:ring-pink-500 focus:border-pink-500"
            : "bg-white dark:bg-gray-700 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        }
        focus:ring-2 ${
          darkMode ? "focus:ring-pink-300" : "focus:ring-blue-300"
        } focus:outline-none
      `}
      autoComplete="off"
    />
  </div>
);

export default ProfilePage;
