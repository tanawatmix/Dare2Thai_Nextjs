"use client";

import { useEffect, useState, useContext, ChangeEvent, useMemo } from "react"; // Added useMemo
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
  FiSearch, // Added Search Icon
  FiChevronLeft, // Added Pagination Icons
  FiChevronRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js"; // Import User type if needed
import Link from "next/link"; // Make sure Link is imported

// --- Type Definitions ---
type SupabaseUser = {
  id: string;
  email?: string | undefined;
};

type Profile = {
  id: string;
  username: string;
  name: string;
  role: string;
};

type Post = {
  id: string;
  user_id: string;
  title: string;
  // Keep profiles as null initially, will be mapped later if needed
  profiles: null; // Changed for simplification in PostTable
};

// Combined type for user table
type CombinedUser = SupabaseUser & Profile;

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
  hidden: { opacity: 0 }, // Simplified fade
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

// --- Loading Spinner Component ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <svg
      className="animate-spin h-8 w-8 text-blue-500 dark:text-pink-400" // Themed spinner
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);
const LoadingComponent = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]"> {/* Themed background */}
    <LoadingSpinner />
    <p className="text-lg text-[var(--foreground)] opacity-80 mt-2">{text}</p>
  </div>
);

// --- Pagination Component ---
const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;

    const handlePrev = () => onPageChange(currentPage - 1);
    const handleNext = () => onPageChange(currentPage + 1);

    return (
        <div className="flex justify-center items-center gap-3 mt-6">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
            >
                <FiChevronLeft />
            </motion.button>
            <span className="text-sm font-medium">
                หน้า {currentPage} / {totalPages}
            </span>
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
            >
                <FiChevronRight />
            </motion.button>
        </div>
    );
};


// --- User Data Table Component ---
const DataTable = ({
  users, // Expecting already filtered users for the current page
  editingUserId,
  editUserData,
  handleEditClick,
  handleCancelEdit,
  handleSaveEdit,
  handleDeleteUser,
  setEditUserData,
  darkMode,
}: {
  users: CombinedUser[]; // Use CombinedUser type
  editingUserId: string | null;
  editUserData: { username: string; name: string };
  handleEditClick: (user: Profile) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
  handleDeleteUser: (userId: string) => void;
  setEditUserData: React.Dispatch<React.SetStateAction<{ username: string; name: string }>>;
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
      className={`overflow-x-auto rounded-lg shadow-lg border ${
        isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}
    >
      <table className="w-full min-w-[600px] table-auto border-collapse"><thead>
          <tr
            className={`${
              isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-600"
            } uppercase text-sm leading-normal`}
          >
            <th className="py-3 px-4 text-left">ชื่อผู้ใช้ (@)</th>
            <th className="py-3 px-4 text-left">ชื่อที่แสดง</th>
            <th className="py-3 px-4 text-left">อีเมล</th>
            <th className="py-3 px-4 text-center">จัดการ</th>
          </tr>
        </thead><tbody
          className={` text-sm divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`} // Added divide-y
        >
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-6 text-gray-500 dark:text-gray-400">
                ไม่พบข้อมูลผู้ใช้ที่ตรงกับคำค้นหา
              </td>
            </tr>
          ) : (
             // AnimatePresence removed for simplicity with pagination
              users.map((user, i) => (
                <motion.tr // Keep row animation
                  key={user.id}
                  custom={i}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`${ isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}
                  layout
                >
                  <td className="py-3 px-4 text-left whitespace-nowrap"> {/* Added whitespace-nowrap */}
                    {editingUserId === user.id ? (
                      <input type="text" value={editUserData.username}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditUserData({ ...editUserData, username: e.target.value })}
                        className="w-full p-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200" />
                    ) : ( user.username )}
                  </td>
                  <td className="py-3 px-4 text-left whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <input type="text" value={editUserData.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditUserData({ ...editUserData, name: e.target.value })}
                         className="w-full p-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200" />
                    ) : ( user.name )}
                  </td>
                  <td className="py-3 px-4 text-left whitespace-nowrap">{user.email || "N/A"}</td>
                  <td className="py-3 px-4 text-center">
                    {editingUserId === user.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1">
                          <FiSave size={12} /> บันทึก
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1">
                          <FiXCircle size={12} /> ยกเลิก
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleEditClick(user)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1">
                          <FiEdit size={12} /> แก้ไข
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDeleteUser(user.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1">
                          <FiTrash2 size={12} /> ลบ
                        </motion.button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))
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
  users: CombinedUser[]; 
  handleDeletePost: (postId: string) => void;
  darkMode?: boolean;
}) => {
  const theme = useContext(ThemeContext);
  const isDark = typeof darkMode === "boolean" ? darkMode : theme?.darkMode;
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.username])), [users]);

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
      <table className="w-full min-w-[600px] table-auto border-collapse"><thead>
          <tr className={`${ isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-600"} uppercase text-sm leading-normal`}>
            <th className="py-3 px-4 text-left">ID โพสต์</th>
            <th className="py-3 px-4 text-left">ผู้โพสต์ (Username)</th>
            <th className="py-3 px-4 text-left">หัวข้อโพสต์</th>
            <th className="py-3 px-4 text-center">จัดการ</th>
          </tr>
        </thead><tbody className={`text-sm divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-6">
                ไม่พบข้อมูลโพสต์ที่ตรงกับคำค้นหา
              </td>
            </tr>
          ) : (
              posts.map((post, i) => {
                const displayUsername = userMap.get(post.user_id) || "N/A"; // Use the map

                return (
                  <motion.tr
                    key={post.id}
                    custom={i}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}
                    layout
                  >
                    <td className="py-3 px-4 text-left font-mono text-xs opacity-70 whitespace-nowrap" title={post.id}>
                      {post.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-left whitespace-nowrap">{displayUsername}</td>
                    <td className="py-3 px-4 text-left">{post.title}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                         {/* ✅ FIX: Remove legacyBehavior and passHref, change motion.a to motion.div */}
                         <Link href={`/post_detail?id=${post.id}`} target="_blank" rel="noopener noreferrer">
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1 cursor-pointer" // Add cursor-pointer
                            >
                                ดูโพสต์
                            </motion.div>
                         </Link>
                         <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeletePost(post.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition flex items-center gap-1"
                         >
                            <FiTrash2 size={12} /> ลบ
                         </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

// --- Main Admin Page Component ---
export default function AdminPage() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const router = useRouter(); // Define router here

  const [allUsers, setAllUsers] = useState<CombinedUser[]>([]); // Store all fetched users
  const [allPosts, setAllPosts] = useState<Post[]>([]); // Store all fetched posts
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState({ username: "", name: "" });
  const [notification, setNotification] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- New States for Tabs, Search, Pagination ---
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Items per page

  // --- Fetch Data & Check Admin Role ---
  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role === "admin") {
          setIsAdmin(true);
          fetchUsers();
          fetchPosts();
        } else {
          toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้"); router.push("/");
        }
      } else { router.push("/login"); }
    };

    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data: combinedUsers, error: functionError } = await supabase.functions.invoke("get-all-users");
      if (functionError) { toast.error("โหลดผู้ใช้: " + functionError.message); console.error(functionError); }
      else if (combinedUsers) { setAllUsers(combinedUsers); }
      setLoadingUsers(false);
    };

    const fetchPosts = async () => {
      setLoadingPosts(true);
      const { data, error } = await supabase.from("posts").select(`id, user_id, title`);
      if (error) { toast.error("โหลดโพสต์: " + error.message); console.error(error); setAllPosts([]); }
      else if (data) {
        const formattedPosts = data.map((p) => ({ ...p, profiles: null })) as Post[];
        setAllPosts(formattedPosts);
      } else { setAllPosts([]); }
      setLoadingPosts(false);
    };

    checkAdminAndFetchData();
  }, [router]); // Added router dependency

  // --- Filtering Logic ---
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    const lowerSearch = searchTerm.toLowerCase();
    return allUsers.filter(u =>
        u.username.toLowerCase().includes(lowerSearch) ||
        u.name.toLowerCase().includes(lowerSearch) ||
        u.email?.toLowerCase().includes(lowerSearch)
    );
  }, [allUsers, searchTerm]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return allPosts;
    const lowerSearch = searchTerm.toLowerCase();
     // Create user map inside useMemo for posts filtering
    const userMap = new Map(allUsers.map(u => [u.id, u.username]));
    return allPosts.filter(p =>
        p.title.toLowerCase().includes(lowerSearch) ||
        userMap.get(p.user_id)?.toLowerCase().includes(lowerSearch)
    );
  }, [allPosts, allUsers, searchTerm]);

  // --- Pagination Logic ---
  const currentTableData = activeTab === 'users' ? filteredUsers : filteredPosts;
  const totalPages = Math.ceil(currentTableData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return currentTableData.slice(startIndex, endIndex);
  }, [currentTableData, currentPage, itemsPerPage]);

  // Reset page when tab or search term changes
  useEffect(() => {
      setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // --- Event Handlers ---
  const handleEditClick = (user: Profile) => { setEditingUserId(user.id); setEditUserData({ username: user.username, name: user.name }); };
  const handleCancelEdit = () => { setEditingUserId(null); setEditUserData({ username: "", name: "" }); };

  const handleSaveEdit = async () => {
    if (!editUserData.username.trim() || !editUserData.name.trim()) { toast.error("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (!editingUserId) return;
    const { data, error } = await supabase.from("profiles")
      .update({ username: editUserData.username.trim(), name: editUserData.name.trim() })
      .eq("id", editingUserId).select("id, username, name, role").single();

    if (error) { toast.error("แก้ไข: " + error.message); }
    else if (data) {
        // Find the original email from allUsers before updating state
        const originalUser = allUsers.find(u => u.id === editingUserId);
        const updatedUserDisplayData: CombinedUser = {
            id: data.id,
            email: originalUser?.email, // Keep the original email
            username: data.username,
            name: data.name,
            role: data.role
        };
        setAllUsers((prev) => prev.map((u) => (u.id === editingUserId ? updatedUserDisplayData : u)));
        setEditingUserId(null);
        showNotification("แก้ไขข้อมูลผู้ใช้สำเร็จ 👍");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) { toast.error("ไม่มีสิทธิ์ลบ"); return; }
    if (confirm(`ต้องการลบผู้ใช้ ${userId.substring(0,8)}... และข้อมูลที่เกี่ยวข้อง?`)) {
      // Ideally, call a 'delete-user' function to remove from auth.users too
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId);
      if (profileError) { toast.error("ลบโปรไฟล์: " + profileError.message); }
      else {
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        setAllPosts((prev) => prev.filter((p) => p.user_id !== userId)); // Remove posts too
        showNotification(`ลบผู้ใช้ ${userId.substring(0, 8)}... สำเร็จ`);
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) { toast.error("ไม่มีสิทธิ์ลบ"); return; }
    if (confirm(`ต้องการลบโพสต์ ${postId.substring(0, 8)}...?`)) {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) { toast.error("ลบโพสต์: " + error.message); }
      else {
        setAllPosts((prev) => prev.filter((p) => p.id !== postId));
        showNotification(`ลบโพสต์ ${postId.substring(0, 8)}... สำเร็จ`);
      }
    }
  };

  const showNotification = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  // --- Render Logic ---
  if (!isAdmin && (loadingUsers || loadingPosts)) { return <LoadingComponent text="กำลังตรวจสอบสิทธิ์..." />; }

  const isLoading = activeTab === 'users' ? loadingUsers : loadingPosts;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className={`min-h-screen p-6 transition-colors duration-300 ${ darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900" }`}>
      <Toaster position="top-center" />
      {/* --- Header --- */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
          หน้าจัดการระบบ (Admin)
        </h1>
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-100"
            onClick={() => router.push("/")}><FiHome /> กลับหน้าหลัก</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-100"
            onClick={() => router.push("/game")}><FiHome /> game </motion.button> {/* Added Game Button */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleDarkMode}
            className={`p-2 rounded-lg font-bold shadow transition ${ darkMode ? "bg-yellow-400 text-black" : "bg-indigo-600 text-white" }`}>
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition"
            onClick={handleLogout}><FiLogOut /> ออกจากระบบ</motion.button>
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

      {/* --- Tabs --- */}
       <div className="mb-6 flex space-x-1 border-b border-gray-300 dark:border-gray-700">
           <TabButton title="จัดการผู้ใช้" icon={<FiUser />} isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
           <TabButton title="จัดการโพสต์" icon={<FiFileText />} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
       </div>

       {/* --- Search Input --- */}
       <div className="mb-6 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
                type="text"
                placeholder={activeTab === 'users' ? "ค้นหา ชื่อผู้ใช้, ชื่อ, อีเมล..." : "ค้นหา หัวข้อโพสต์, ชื่อผู้ใช้..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition duration-200
                    ${darkMode
                        ? 'bg-gray-800 border-gray-600 focus:ring-pink-500 focus:border-pink-500 text-white'
                        : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black'
                    }
                `}
            />
       </div>

       {/* --- Table Content based on Active Tab --- */}
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div key="loading" variants={tableFade} initial="hidden" animate="visible" exit="exit">
                     <LoadingSpinner />
                </motion.div>
            ) : (
                <motion.div key={activeTab} variants={tableFade} initial="hidden" animate="visible" exit="exit">
                    {activeTab === 'users' && (
                        <DataTable
                            users={paginatedData as CombinedUser[]}
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
                    {activeTab === 'posts' && (
                        <PostTable
                            posts={paginatedData as Post[]}
                            users={allUsers} // Pass full list for username lookup
                            handleDeletePost={handleDeletePost}
                            darkMode={darkMode}
                        />
                    )}
                     <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </motion.div>
            )}
       </AnimatePresence>
    </motion.div>
  );
}

// --- Tab Button Component ---
const TabButton = ({ title, icon, isActive, onClick }: { title: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => {
    const { darkMode } = useContext(ThemeContext);
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
                isActive
                ? `${darkMode ? 'border-pink-400 text-pink-400' : 'border-blue-500 text-blue-600'}`
                : `border-transparent dark:text-gray-400 hover:${darkMode ? ' border-gray-500' : ' border-gray-300'}`
            }`}
        >
            {icon}
            {title}
        </button>
    );
};

