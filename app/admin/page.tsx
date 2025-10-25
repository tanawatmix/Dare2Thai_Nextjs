"use client";

import { useEffect, useState, useContext, ChangeEvent } from "react";
import { ThemeContext } from "../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  FiEdit,
  FiTrash2,
  FiUser,
  FiFileText,
  FiSun,
  FiMoon,
  FiHome,
  FiLogOut,
  FiSave,
  FiXCircle,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js"; // Import User type if needed

// --- Type Definitions ---
type SupabaseUser = {
  id: string; // UUID from auth.users / profiles
  email?: string | undefined; // Make email optional as we might mock it
};

type Profile = {
  id: string; // Should match auth.users id
  username: string;
  name: string; // Ensure this column exists in your profiles table
  role: string;
};

type Post = {
  id: string; // UUID from posts table
  user_id: string; // Foreign key referencing profiles.id (or auth.users.id)
  title: string;
  // Allow profiles to be object, array, or null to handle JOIN variations
  profiles: { username: string } | { username: string }[] | null;
};

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const tableFade = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } },
};

// --- Loading Spinner Component ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <svg
      className="animate-spin h-8 w-8 text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);
const LoadingComponent = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <LoadingSpinner /> {/* Reuse the spinner */}
    <p className="text-lg text-[var(--foreground)] opacity-80 mt-2">{text}</p>
  </div>
);

// --- Section Component ---
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-12">
    <motion.h2
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      // ✅ FIX: ใช้สีจาก CSS Variable
      className="text-2xl font-semibold mb-5 text-[var(--foreground)] opacity-90 flex items-center gap-2"
    >
      {title === "จัดการผู้ใช้" ? <FiUser /> : <FiFileText />} {title}
    </motion.h2>
    {children}
  </section>
);

// --- User Data Table Component ---
const DataTable = ({
  users,
  editingUserId,
  editUserData,
  handleEditClick,
  handleCancelEdit,
  handleSaveEdit,
  handleDeleteUser,
  setEditUserData,
  darkMode,
}: {
  users: (SupabaseUser & Profile)[];
  editingUserId: string | null;
  editUserData: { username: string; name: string };
  handleEditClick: (user: Profile) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
  handleDeleteUser: (userId: string) => void;
  setEditUserData: React.Dispatch<
    React.SetStateAction<{ username: string; name: string }>
  >;
  darkMode?: boolean;
}) => {
  const theme = useContext(ThemeContext);
  const isDark = typeof darkMode === "boolean" ? darkMode : theme?.darkMode;

  return (
    <motion.div
      key="users-table"
      variants={tableFade}
      initial="hidden"
      animate="visible"
      exit="exit"
      // ✅ FIX: ใช้สีพื้นหลังตารางที่ตัดกับ Body
      className={`overflow-x-auto rounded-lg shadow-lg border ${
        isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}
    >
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr
            className={`${
              isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-600"
            } uppercase text-sm leading-normal`}
          >
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">ชื่อผู้ใช้ (@)</th>
            <th className="py-3 px-4 text-left">ชื่อที่แสดง</th>
            <th className="py-3 px-4 text-left">อีเมล</th>
            <th className="py-3 px-4 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody
          className={`${isDark ? "text-gray-200" : "text-gray-700"} text-sm`}
        >
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-6 text-gray-500">
                ไม่พบข้อมูลผู้ใช้
              </td>
            </tr>
          ) : (
            <AnimatePresence>
              {users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  custom={i}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`border-b ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-700/50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  layout
                >
                  <td
                    className="py-3 px-4 text-left font-mono text-xs opacity-70"
                    title={user.id}
                  >
                    {user.id.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 text-left">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editUserData.username}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setEditUserData({
                            ...editUserData,
                            username: e.target.value,
                          })
                        }
                        className="w-full p-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td className="py-3 px-4 text-left">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editUserData.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setEditUserData({
                            ...editUserData,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="py-3 px-4 text-left">{user.email || "N/A"}</td>
                  <td className="py-3 px-4 text-center">
                    {editingUserId === user.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveEdit}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1"
                        >
                          <FiSave size={12} /> บันทึก
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1"
                        >
                          <FiXCircle size={12} /> ยกเลิก
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditClick(user)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1"
                        >
                          <FiEdit size={12} /> แก้ไข
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1"
                        >
                          <FiTrash2 size={12} /> ลบ
                        </motion.button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

// --- Post Data Table Component ---
const PostTable = ({
  posts,
  users,
  handleDeletePost,
  darkMode,
}: {
  posts: Post[];
  users: (SupabaseUser & Profile)[];
  handleDeletePost: (postId: string) => void;
  darkMode?: boolean;
}) => {
  const theme = useContext(ThemeContext);
  const isDark = typeof darkMode === "boolean" ? darkMode : theme?.darkMode;

  return (
    <motion.div
      key="posts-table"
      variants={tableFade}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`overflow-x-auto rounded-lg shadow-lg border ${
        isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}
    >
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr
            className={`${
              isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-600"
            } uppercase text-sm leading-normal`}
          >
            <th className="py-3 px-4 text-left">ID โพสต์</th>
            <th className="py-3 px-4 text-left">ผู้โพสต์ (Username)</th>
            <th className="py-3 px-4 text-left">หัวข้อโพสต์</th>
            <th className="py-3 px-4 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody
          className={`${isDark ? "text-gray-200" : "text-gray-700"} text-sm`}
        >
          {posts.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-6 text-gray-500">
                ไม่พบข้อมูลโพสต์
              </td>
            </tr>
          ) : (
            <AnimatePresence>
              {posts.map((post, i) => {
                const userProfile = users.find((u) => u.id === post.user_id);

                let displayUsername = "N/A";
                if (post.profiles) {
                  if (Array.isArray(post.profiles)) {
                    displayUsername = post.profiles[0]?.username || "N/A";
                  } else {
                    displayUsername = post.profiles.username || "N/A";
                  }
                } else if (userProfile) {
                  displayUsername = userProfile.username;
                }

                return (
                  <motion.tr
                    key={post.id}
                    custom={i}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`border-b ${
                      isDark
                        ? "border-gray-700 hover:bg-gray-700/50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    layout
                  >
                    <td
                      className="py-3 px-4 text-left font-mono text-xs opacity-70"
                      title={post.id}
                    >
                      {post.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-left">{displayUsername}</td>
                    <td className="py-3 px-4 text-left">{post.title}</td>
                    <td className="py-3 px-4 text-center">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeletePost(post.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1 mx-auto"
                      >
                        <FiTrash2 size={12} /> ลบ
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

// --- Main Admin Page Component ---
export default function AdminPage() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const router = useRouter();

  const [users, setUsers] = useState<(SupabaseUser & Profile)[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState({ username: "", name: "" });
  const [notification, setNotification] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Fetch Data & Check Admin Role ---
  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          setIsAdmin(true);
          fetchUsers();
          fetchPosts();
        } else {
          toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
          router.push("/");
        }
      } else {
        router.push("/login");
      }
    };

    // ใน AdminPage.tsx

    const fetchUsers = async () => {
      setLoadingUsers(true);

      // ✅ เปลี่ยนมาเรียกใช้ Edge Function
      const { data: combinedUsers, error: functionError } =
        await supabase.functions.invoke("get-all-users");

      if (functionError) {
        toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้: " + functionError.message);
        console.error("Function invoke error:", functionError);
      } else if (combinedUsers) {
        setUsers(combinedUsers); // ข้อมูลที่ได้จะมีอีเมลจริงอยู่แล้ว
      }

      setLoadingUsers(false);
    };

    const fetchPosts = async () => {
      setLoadingPosts(true);
      console.log("AdminPage: Attempting to fetch posts (simplified)...");

      // ✅ FIX: ดึงข้อมูลเฉพาะตาราง posts ไม่ต้อง JOIN profiles
      const { data, error } = await supabase
        .from("posts")
        .select(`id, user_id, title`);

      console.log("AdminPage: Fetch posts response (simplified):", {
        data,
        error,
      });

      if (error) {
        toast.error("ไม่สามารถโหลดข้อมูลโพสต์: " + error.message);
        console.error("AdminPage: Supabase fetch posts error details:", error);
        setPosts([]);
      } else if (data) {
        console.log("AdminPage: Raw posts data received (simplified):", data);
        const formattedPosts = data.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          title: p.title,
          profiles: null, // ตั้งเป็น null ไว้ก่อน เดี๋ยว PostTable ไปหา username เอง
        })) as Post[];
        setPosts(formattedPosts);
        console.log("AdminPage: Posts state updated (simplified).");
      } else {
        console.log(
          "AdminPage: No posts data returned (simplified), but no error."
        );
        setPosts([]);
      }
      setLoadingPosts(false);
    };

    checkAdminAndFetchData();
  }, [router]);

  // --- Event Handlers ---
  const handleEditClick = (user: Profile) => {
    setEditingUserId(user.id);
    setEditUserData({ username: user.username, name: user.name });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditUserData({ username: "", name: "" });
  };

  const handleSaveEdit = async () => {
    if (!editUserData.username.trim() || !editUserData.name.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (!editingUserId) return;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: editUserData.username.trim(),
        name: editUserData.name.trim(),
      })
      .eq("id", editingUserId)
      .select("id, username, name, role")
      .single();

    if (error) {
      toast.error("แก้ไขข้อมูลไม่สำเร็จ: " + error.message);
    } else if (data) {
      const updatedUserDisplayData = {
        ...users.find((u) => u.id === editingUserId),
        ...data,
      };
      setUsers((prev) =>
        prev.map(
          (u) =>
            (u.id === editingUserId
              ? updatedUserDisplayData
              : u) as SupabaseUser & Profile
        )
      );
      setEditingUserId(null);
      showNotification("แก้ไขข้อมูลผู้ใช้สำเร็จ 👍");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) {
      toast.error("คุณไม่มีสิทธิ์ลบผู้ใช้");
      return;
    }
    if (
      confirm(
        `ต้องการลบผู้ใช้ ID: ${userId.substring(
          0,
          8
        )}... และข้อมูลที่เกี่ยวข้อง? การกระทำนี้ไม่สามารถย้อนกลับได้!`
      )
    ) {
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) {
        toast.error("ลบโปรไฟล์ไม่สำเร็จ: " + profileError.message);
      } else {
        // ที่จริงแล้วควรเรียก Edge Function 'delete-user' ที่ลบจาก auth.users ด้วย
        // แต่สำหรับตอนนี้ เราจะแค่ลบโปรไฟล์และข้อมูลใน state
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setPosts((prev) => prev.filter((p) => p.user_id !== userId));
        showNotification(`ลบผู้ใช้ ID: ${userId.substring(0, 8)}... สำเร็จ`);
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) {
      toast.error("คุณไม่มีสิทธิ์ลบโพสต์");
      return;
    }
    if (
      confirm(`ต้องการลบโพสต์ ID: ${postId.substring(0, 8)}... ใช่หรือไม่?`)
    ) {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) {
        toast.error("ลบโพสต์ไม่สำเร็จ: " + error.message);
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showNotification(`ลบโพสต์ ID: ${postId.substring(0, 8)}... สำเร็จ`);
      }
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // --- Render Logic ---
  if (!isAdmin && (loadingUsers || loadingPosts)) {
    return <LoadingComponent text="กำลังตรวจสอบสิทธิ์..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // ✅ FIX: ใช้ CSS Variables สำหรับพื้นหลังและสีข้อความ และลบ font-sriracha
      className={`min-h-screen p-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster position="top-center" />
      {/* --- Header --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-between mb-8 gap-4"
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
          หน้าจัดการระบบ (Admin)
        </h1>
        <div className="flex items-center gap-3">
          {/* ✅ FIX: ปรับสีปุ่ม "กลับหน้าหลัก" ให้เข้ากับธีม */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-100"
            onClick={() => router.push("/")}
          >
            <FiHome /> กลับหน้าหลัก
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-100"
            onClick={() => router.push("/game")}
          >
            <FiHome /> game
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg font-bold shadow transition ${
              darkMode ? "bg-yellow-400 text-black" : "bg-indigo-600 text-white"
            }`}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            <FiLogOut /> ออกจากระบบ
          </motion.button>
        </div>
      </motion.div>

      {/* --- Notification --- */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Users Table --- */}
      <Section title="จัดการผู้ใช้">
        {loadingUsers ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            users={users}
            editingUserId={editingUserId}
            editUserData={editUserData}
            handleEditClick={handleEditClick}
            handleCancelEdit={handleCancelEdit}
            handleSaveEdit={handleSaveEdit}
            handleDeleteUser={handleDeleteUser}
            setEditUserData={setEditUserData}
            darkMode={darkMode}
          />
        )}
      </Section>
      {/* --- Posts Table --- */}
      <Section title="จัดการโพสต์">
        {loadingPosts ? (
          <LoadingSpinner />
        ) : (
          <PostTable
            posts={posts}
            users={users}
            handleDeletePost={handleDeletePost}
            darkMode={darkMode}
          />
        )}
      </Section>
    </motion.div>
  );
}
