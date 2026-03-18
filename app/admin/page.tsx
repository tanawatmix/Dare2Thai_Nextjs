"use client";

import { useEffect, useState, useContext, ChangeEvent, useMemo } from "react";
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
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiRss,
  FiEye,
  FiSliders,
  FiPlus,
  FiImage,
  FiShield,
  FiGamepad,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
  profiles: null;
};

type NewsArticle = {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
};

type HeroSlide = {
  id: string;
  title: string | null;
  image_url: string | null;
  created_at: string;
};
type CombinedUser = SupabaseUser & Profile;

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const tableFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// --- Components ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 dark:border-pink-500"></div>
  </div>
);

const LoadingComponent = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <LoadingSpinner />
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 animate-pulse">{text}</p>
  </div>
);

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all text-gray-600 dark:text-gray-300"
      >
        <FiChevronLeft size={18} />
      </motion.button>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        หน้า <span className="text-blue-600 dark:text-pink-400 font-bold">{currentPage}</span> จาก {totalPages}
      </span>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all text-gray-600 dark:text-gray-300"
      >
        <FiChevronRight size={18} />
      </motion.button>
    </div>
  );
};

// --- Table Components ---
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
}: any) => {
  return (
    <motion.div
      variants={tableFade}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="overflow-hidden rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">ชื่อที่แสดง</th>
              <th className="px-6 py-4 font-medium tracking-wider">อีเมล</th>
              <th className="px-6 py-4 font-medium tracking-wider text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            ) : (
              users.map((user: any, i: number) => (
                <motion.tr
                  key={user.id}
                  custom={i}
                  variants={fadeInUp}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editUserData.name}
                        onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                        className="w-full p-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-blue-600 dark:text-gray-300 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                        {user.role === "admin" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-pink-500/20 dark:text-pink-400">
                            <FiShield size={10} /> Admin
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.email || "N/A"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {editingUserId === user.id ? (
                        <>
                          <button onClick={handleSaveEdit} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 rounded-lg transition-colors" title="บันทึก">
                            <FiSave size={16} />
                          </button>
                          <button onClick={handleCancelEdit} className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg transition-colors" title="ยกเลิก">
                            <FiXCircle size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(user)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors" title="แก้ไข">
                            <FiEdit size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-lg transition-colors" title="ลบ">
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const PostTable = ({ posts, users, handleDeletePost }: any) => {
  const userMap = useMemo(() => new Map(users.map((u: any) => [u.id, u.username])), [users]);

  return (
    <motion.div variants={tableFade} initial="hidden" animate="visible" exit="exit" className="overflow-hidden rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider w-32">ID โพสต์</th>
              <th className="px-6 py-4 font-medium tracking-wider">ผู้โพสต์</th>
              <th className="px-6 py-4 font-medium tracking-wider">หัวข้อโพสต์</th>
              <th className="px-6 py-4 font-medium tracking-wider text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {posts.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูลโพสต์</td></tr>
            ) : (
              posts.map((post: any, i: number) => (
                <motion.tr key={post.id} custom={i} variants={fadeInUp} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{post.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap">{userMap.get(post.user_id) || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{post.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/post_detail?id=${post.id}`} target="_blank">
                        <button className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:text-purple-400 rounded-lg transition-colors" title="ดูโพสต์">
                          <FiEye size={16} />
                        </button>
                      </Link>
                      <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-lg transition-colors" title="ลบ">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const NewsTable = ({ news, handleDeleteNews }: any) => {
  return (
    <motion.div variants={tableFade} initial="hidden" animate="visible" exit="exit" className="overflow-hidden rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider w-24">รูปภาพ</th>
              <th className="px-6 py-4 font-medium tracking-wider">หัวข้อข่าว</th>
              <th className="px-6 py-4 font-medium tracking-wider text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {news.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูลข่าวสาร</td></tr>
            ) : (
              news.map((item: any, i: number) => (
                <motion.tr key={item.id} custom={i} variants={fadeInUp} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.title} width={64} height={48} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).src = "/dare2New.png"; }} />
                      ) : (
                        <FiFileText className="text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{item.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/manage-news?edit=${item.id}`}>
                        <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors" title="แก้ไข">
                          <FiEdit size={16} />
                        </button>
                      </Link>
                      <button onClick={() => handleDeleteNews(item.id, item.title)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-lg transition-colors" title="ลบ">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const SlidesTable = ({ slides, handleDeleteSlide }: any) => {
  return (
    <motion.div variants={tableFade} initial="hidden" animate="visible" exit="exit" className="overflow-hidden rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider w-32">รูปภาพ</th>
              <th className="px-6 py-4 font-medium tracking-wider">หัวข้อ (Title)</th>
              <th className="px-6 py-4 font-medium tracking-wider text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {slides.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูลสไลด์</td></tr>
            ) : (
              slides.map((item: any, i: number) => (
                <motion.tr key={item.id} custom={i} variants={fadeInUp} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      {item.image_url ? (
                        <Image src={item.image_url} alt="Slide" width={96} height={56} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).src = "/dare2New.png"; }} />
                      ) : (
                        <FiImage className="text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{item.title || <span className="text-gray-400 italic">(ไม่มีหัวข้อ)</span>}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/manage-slides?edit=${item.id}`}>
                        <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors" title="แก้ไข">
                          <FiEdit size={16} />
                        </button>
                      </Link>
                      <button onClick={() => handleDeleteSlide(item.id, item.title)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-lg transition-colors" title="ลบ">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};


// --- Main Page ---
export default function AdminPage() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<CombinedUser[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [allSlides, setAllSlides] = useState<HeroSlide[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState({ username: "", name: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<"users" | "posts" | "news" | "slides">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Fetch Data Logic Remains Exactly the Same ---
  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role === "admin") {
          setIsAdmin(true);
          fetchUsers();
          fetchPosts();
          fetchNews();
          fetchSlides();
        } else {
          toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
          router.push("/");
        }
      } else {
        router.push("/login");
      }
    };

    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data: combinedUsers, error } = await supabase.functions.invoke("get-all-users");
      if (!error && combinedUsers) setAllUsers(combinedUsers);
      setLoadingUsers(false);
    };

    const fetchPosts = async () => {
      setLoadingPosts(true);
      const { data, error } = await supabase.from("posts").select(`id, user_id, title`);
      if (!error && data) setAllPosts(data.map((p) => ({ ...p, profiles: null })) as Post[]);
      setLoadingPosts(false);
    };

    const fetchNews = async () => {
      setLoadingNews(true);
      const { data, error } = await supabase.from("news").select(`id, title, image_url, created_at`);
      if (!error && data) setAllNews(data as NewsArticle[]);
      setLoadingNews(false);
    };

    const fetchSlides = async () => {
      setLoadingSlides(true);
      const { data, error } = await supabase.from("hero_slides").select(`id, title, image_url, created_at`).order("created_at", { ascending: false });
      if (!error && data) setAllSlides(data as HeroSlide[]);
      setLoadingSlides(false);
    };

    checkAdminAndFetchData();
  }, [router]);

  // Filters
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    const lowerSearch = searchTerm.toLowerCase();
    return allUsers.filter((u) => u.username.toLowerCase().includes(lowerSearch) || u.name.toLowerCase().includes(lowerSearch) || (u.email && u.email.toLowerCase().includes(lowerSearch)));
  }, [allUsers, searchTerm]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return allPosts;
    const lowerSearch = searchTerm.toLowerCase();
    const userMap = new Map(allUsers.map((u) => [u.id, u.username]));
    return allPosts.filter((p) => p.title.toLowerCase().includes(lowerSearch) || userMap.get(p.user_id)?.toLowerCase().includes(lowerSearch));
  }, [allPosts, allUsers, searchTerm]);

  const filteredNews = useMemo(() => {
    if (!searchTerm) return allNews;
    return allNews.filter((n) => n.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allNews, searchTerm]);

  const filteredSlides = useMemo(() => {
    if (!searchTerm) return allSlides;
    const lowerSearch = searchTerm.toLowerCase();
    return allSlides.filter((s) => (s.title && s.title.toLowerCase().includes(lowerSearch)) || s.id.toLowerCase().includes(lowerSearch));
  }, [allSlides, searchTerm]);

  const currentTableData = activeTab === "users" ? filteredUsers : activeTab === "posts" ? filteredPosts : activeTab === "news" ? filteredNews : filteredSlides;
  const totalPages = Math.ceil(currentTableData.length / itemsPerPage);
  const paginatedData = useMemo(() => currentTableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [currentTableData, currentPage, itemsPerPage]);

  useEffect(() => setCurrentPage(1), [activeTab, searchTerm]);

  // --- Handlers ---
  const handleEditClick = (user: Profile) => { setEditingUserId(user.id); setEditUserData({ username: user.username, name: user.name }); };
  const handleCancelEdit = () => { setEditingUserId(null); setEditUserData({ username: "", name: "" }); };

  const handleSaveEdit = async () => {
    if (!editUserData.username.trim() || !editUserData.name.trim()) return toast.error("กรุณากรอกข้อมูลให้ครบ");
    if (!editingUserId) return;
    const promise = supabase.from("profiles").update({ username: editUserData.username.trim(), name: editUserData.name.trim() }).eq("id", editingUserId).select("id, name, role").single();
    
    toast.promise(promise as any, {
      loading: "กำลังบันทึก...",
      success: (response) => {
        const { data, error } = response as any;
        if (error || !data) throw new Error(error?.message || "ไม่สามารถบันทึกข้อมูลได้");
        const originalUser = allUsers.find((u) => u.id === editingUserId);
        setAllUsers((prev) => prev.map((u) => (u.id === editingUserId ? { id: data.id, email: originalUser?.email, username: data.username, name: data.name, role: data.role } : u)));
        setEditingUserId(null);
        return "บันทึกข้อมูลผู้ใช้สำเร็จ 👍";
      },
      error: "แก้ไขไม่สำเร็จ",
    });
  };

  const handleDeleteUser = async (userId: string) => { /* Same logic as original, shortened for brevity if desired, but kept identical functionally */
     if (!isAdmin) return toast.error("ไม่มีสิทธิ์ลบ");
     try {
       await toast.promise(new Promise<void>((resolve, reject) => {
         import("sweetalert2").then(async (Swal) => {
           const res = await Swal.default.fire({ title: `ต้องการลบผู้ใช้?`, text: "การกระทำนี้จะลบโปรไฟล์และไม่สามารถย้อนกลับได้!", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "ลบเลย", cancelButtonText: "ยกเลิก" });
           res.isConfirmed ? resolve() : reject(new Error("User cancelled"));
         });
       }), { loading: "กำลังตรวจสอบ...", success: "ยืนยันการลบ", error: (e) => e.message === "User cancelled" ? "ยกเลิก" : "ลบไม่สำเร็จ" });
       await supabase.from("profiles").delete().eq("id", userId);
       setAllUsers((prev) => prev.filter((u) => u.id !== userId));
       toast.success("ลบสำเร็จ");
     } catch(e:any) {}
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) return toast.error("ไม่มีสิทธิ์ลบ");
    try {
      await toast.promise(new Promise<void>((resolve, reject) => {
         import("sweetalert2").then(async (Swal) => {
           const res = await Swal.default.fire({ title: `ต้องการลบโพสต์?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "ลบเลย", cancelButtonText: "ยกเลิก" });
           res.isConfirmed ? resolve() : reject(new Error("User cancelled"));
         });
      }), { loading: "...", success: "ยืนยันการลบ", error: (e) => e.message });
      await supabase.from("posts").delete().eq("id", postId);
      setAllPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("ลบสำเร็จ");
    } catch (e: any) {}
  };

  const handleDeleteNews = async (newsId: string, newsTitle: string) => {
    if (!isAdmin) return toast.error("ไม่มีสิทธิ์ลบ");
    const article = allNews.find(n => n.id === newsId);
    try {
      await toast.promise(new Promise<void>((resolve, reject) => {
         import("sweetalert2").then(async (Swal) => {
           const res = await Swal.default.fire({ title: `ลบข่าว "${newsTitle}"?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "ลบเลย", cancelButtonText: "ยกเลิก" });
           res.isConfirmed ? resolve() : reject(new Error("User cancelled"));
         });
      }), { loading: "...", success: "ยืนยันการลบ", error: (e) => e.message });
      if (article?.image_url) {
        const fileName = article.image_url.split("/").pop();
        if (fileName) await supabase.storage.from("news_images").remove([`public/${fileName}`]);
      }
      await supabase.from("news").delete().eq("id", newsId);
      setAllNews((prev) => prev.filter((n) => n.id !== newsId));
      toast.success("ลบสำเร็จ");
    } catch (e: any) {}
  };

  const handleDeleteSlide = async (slideId: string, slideTitle: string | null) => {
    if (!isAdmin) return toast.error("ไม่มีสิทธิ์ลบ");
    const slide = allSlides.find(s => s.id === slideId);
    try {
      await toast.promise(new Promise<void>((resolve, reject) => {
         import("sweetalert2").then(async (Swal) => {
           const res = await Swal.default.fire({ title: `ลบสไลด์?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "ลบเลย", cancelButtonText: "ยกเลิก" });
           res.isConfirmed ? resolve() : reject(new Error("User cancelled"));
         });
      }), { loading: "...", success: "ยืนยันการลบ", error: (e) => e.message });
      if (slide?.image_url) {
        const fileName = slide.image_url.split("/").pop();
        if (fileName) await supabase.storage.from("hero_images").remove([`public/${fileName}`]);
      }
      await supabase.from("hero_slides").delete().eq("id", slideId);
      setAllSlides((prev) => prev.filter((s) => s.id !== slideId));
      toast.success("ลบสำเร็จ");
    } catch (e: any) {}
  };

  if (!isAdmin && (loadingUsers || loadingPosts || loadingNews || loadingSlides)) {
    return <LoadingComponent text="กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ..." />;
  }

  const isLoading = activeTab === "users" ? loadingUsers : activeTab === "posts" ? loadingPosts : activeTab === "news" ? loadingNews : loadingSlides;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-[#0B1120] text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', background: darkMode ? '#1F2937' : '#FFFFFF', color: darkMode ? '#F9FAFB' : '#111827'} }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* --- Header --- */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500 dark:from-blue-400 dark:to-pink-400">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">จัดการระบบ ผู้ใช้ โพสต์ และข่าวสารทั้งหมดในที่เดียว</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FiHome size={16} /> <span className="hidden sm:inline">หน้าหลัก</span>
              </motion.button>
            </Link>
            <Link href="/game">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FiGamepad size={16} /> <span className="hidden sm:inline">เกม</span>
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleDarkMode} className="p-2.5 rounded-xl font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-yellow-500 dark:text-blue-400">
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => supabase.auth.signOut().then(()=>router.push('/'))} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
              <FiLogOut size={16} /> <span className="hidden sm:inline">ออกจากระบบ</span>
            </motion.button>
          </div>
        </motion.div>

        {/* --- Main Content Area --- */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          
          {/* Controls Bar (Tabs + Search + Add Action) */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center mb-8">
            
            {/* Tabs (Pill Style) */}
            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <TabButton title="ผู้ใช้" icon={<FiUser />} isActive={activeTab === "users"} onClick={() => setActiveTab("users")} />
              <TabButton title="โพสต์" icon={<FiFileText />} isActive={activeTab === "posts"} onClick={() => setActiveTab("posts")} />
              <TabButton title="ข่าวสาร" icon={<FiRss />} isActive={activeTab === "news"} onClick={() => setActiveTab("news")} />
              <TabButton title="สไลด์" icon={<FiSliders />} isActive={activeTab === "slides"} onClick={() => setActiveTab("slides")} />
            </div>

            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 items-center">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-pink-500/50 text-sm transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>

              {/* Add Button */}
              <AnimatePresence>
                {(activeTab === "slides" || activeTab === "news") && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full sm:w-auto">
                    <Link href={activeTab === "slides" ? "/admin/manage-slides" : "/admin/manage-news"}>
                      <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors">
                        <FiPlus size={18} /> {activeTab === "slides" ? "สร้างสไลด์" : "สร้างข่าว"}
                      </button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Table Area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" variants={tableFade} initial="hidden" animate="visible" exit="exit" className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </motion.div>
              ) : (
                <motion.div key={activeTab} variants={tableFade} initial="hidden" animate="visible" exit="exit">
                  {activeTab === "users" && <DataTable users={paginatedData} editingUserId={editingUserId} editUserData={editUserData} handleEditClick={handleEditClick} handleCancelEdit={handleCancelEdit} handleSaveEdit={handleSaveEdit} handleDeleteUser={handleDeleteUser} setEditUserData={setEditUserData} />}
                  {activeTab === "posts" && <PostTable posts={paginatedData} users={allUsers} handleDeletePost={handleDeletePost} />}
                  {activeTab === "news" && <NewsTable news={paginatedData} handleDeleteNews={handleDeleteNews} />}
                  {activeTab === "slides" && <SlidesTable slides={paginatedData} handleDeleteSlide={handleDeleteSlide} />}
                  <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Modern Pill Tab Button ---
const TabButton = ({ title, icon, isActive, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
        isActive
          ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-pink-400 shadow-sm border border-gray-200/50 dark:border-gray-700"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 border border-transparent"
      }`}
    >
      <span className={isActive ? "opacity-100" : "opacity-70"}>{icon}</span>
      {title}
    </button>
  );
};