"use client";

import {
  useEffect,
  useState,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
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
  FiLock,
  FiUserCheck,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// --- Animations ---
const fader = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

// --- Sub Components ---
const LoadingComponent = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500"
    />
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4">
      {text}
    </p>
  </div>
);

const StatCard = ({
  label,
  value,
  icon,
  accent,
  darkMode,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
  darkMode: boolean;
}) => {
  const colors: Record<string, string> = {
    indigo: "from-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    violet: "from-violet-500/15 text-violet-600 dark:text-violet-400",
    teal: "from-teal-500/15 text-teal-600 dark:text-teal-400",
    amber: "from-amber-500/15 text-amber-600 dark:text-amber-400",
  };
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        darkMode
          ? "bg-gray-800 border-gray-700 hover:border-pink-500"
          : "bg-white border-gray-200 hover:border-blue-500"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold ">{value}</p>
        </div>
        <div className={`rounded-xl bg-linear-to-br p-3 ${colors[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ title, icon, isActive, onClick, count }: { title: string; icon: ReactNode; isActive: boolean; onClick: () => void; count: number }) => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive ? (darkMode ? "bg-slate-800" : "bg-white") : (darkMode ? "text-pink-400" : "text-blue-500")}`}
    >
      {icon}
      <span>{title}</span>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? (darkMode ? "bg-pink-500/20 text-pink-400" : "bg-blue-100 text-blue-700") : (darkMode ? "bg-pink-500/20 text-pink-400" : "bg-slate-200/60")}`}>
        {count}
      </span>
    </button>
  );
};

// --- Generic Dynamic Table ---
const DynamicTable = ({
  headers,
  items,
  renderRow,
}: {
  headers: string[];
  items: any[];
  renderRow: (item: any, index: number) => ReactNode;
}) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-gray-200 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-6 py-4 font-medium ${i === headers.length - 1 ? "text-center" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              items.map((item, i) => renderRow(item, i))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Admin Dashboard ---
export default function AdminPage() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const router = useRouter();

  const [data, setData] = useState({
    users: [] as any[],
    posts: [] as any[],
    news: [] as any[],
    slides: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "users" | "posts" | "news" | "slides"
  >("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add("dark") : root.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const initDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        return router.push("/");
      }

      const [resUsers, resPosts, resNews, resSlides] = await Promise.all([
        supabase.functions.invoke("get-all-users"),
        supabase.from("posts").select("id, user_id, title"),
        supabase.from("news").select("id, title, image_url, created_at"),
        supabase
          .from("hero_slides")
          .select("id, title, image_url, created_at")
          .order("created_at", { ascending: false }),
      ]);

      setData({
        users: resUsers.data || [],
        posts: resPosts.data || [],
        news: resNews.data || [],
        slides: resSlides.data || [],
      });
      setLoading(false);
    };
    initDashboard();
  }, [router]);

  // Filters
  const userMap = useMemo(
    () => new Map(data.users.map((u) => [u.id, u.username || u.name || ""])),
    [data.users],
  );

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return data[activeTab];
    if (activeTab === "users")
      return data.users.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term),
      );
    if (activeTab === "posts")
      return data.posts.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          userMap.get(p.user_id)?.toLowerCase().includes(term),
      );
    if (activeTab === "news")
      return data.news.filter((n) => n.title.toLowerCase().includes(term));
    return data.slides.filter(
      (s) => s.title?.toLowerCase().includes(term) || s.id.includes(term),
    );
  }, [data, activeTab, searchTerm, userMap]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedItems = useMemo(
    () =>
      filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [filteredData, currentPage],
  );

  useEffect(() => setCurrentPage(1), [activeTab, searchTerm]);

  // Handlers
  const handleConfirmAction = async (title: string, text: string) => {
    const Swal = (await import("sweetalert2")).default;
    const res = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
    return res.isConfirmed;
  };

  const handleDelete = async (
    table: string,
    id: string,
    storageBucket?: string,
  ) => {
    if (
      !(await handleConfirmAction(
        "ต้องการลบข้อมูลนี้?",
        "การกระทำนี้จะไม่สามารถย้อนกลับได้",
      ))
    )
      return;

    if (storageBucket) {
      const item = (data as any)[table].find((x: any) => x.id === id);
      const fileName = item?.image_url?.split("/").pop();
      if (fileName)
        await supabase.storage
          .from(storageBucket)
          .remove([`public/${fileName}`]);
    }

    await supabase.from(table).delete().eq("id", id);
    setData((prev) => ({
      ...prev,
      [table]: (prev as any)[table].filter((x: any) => x.id !== id),
    }));
    toast.success("ลบสำเร็จ");
  };

  if (loading)
    return <LoadingComponent text="กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ..." />;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: darkMode ? "#0f172a" : "#FFF",
            color: darkMode ? "#F1F5F9" : "#0f172a",
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <motion.div variants={fader} initial="hidden" animate="visible">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl mb-8 bg-linear-to-br from-indigo-600 to-violet-800 px-6 py-8 shadow-lg text-white">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <FiShield size={12} /> Admin Console
                </span>
                <h1 className="text-3xl font-bold mt-2">Dashboard</h1>
                <p className="text-sm text-indigo-100 mt-1">
                  จัดการทุกระบบบนเว็บไซต์จากศูนย์กลางเดียว
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-white/10 hover:bg-white/20">
                    <FiHome /> หน้าหลัก
                  </button>
                </Link>
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  {darkMode ? <FiSun /> : <FiMoon />}
                </button>
                <button
                  onClick={() =>
                    supabase.auth.signOut().then(() => router.push("/"))
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-red-500 hover:bg-red-600"
                >
                  <FiLogOut /> ออกจากระบบ
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ">
            <StatCard
              label="ผู้ใช้"
              value={data.users.length}
              icon={<FiUser />}
              accent="indigo"
              darkMode={darkMode}
            />
            <StatCard
              label="โพสต์"
              value={data.posts.length}
              icon={<FiFileText />}
              accent="violet"
              darkMode={darkMode}
            />
            <StatCard
              label="ข่าวสาร"
              value={data.news.length}
              icon={<FiRss />}
              accent="teal"
              darkMode={darkMode}
            />
            <StatCard
              label="สไลด์"
              value={data.slides.length}
              icon={<FiSliders />}
              accent="amber"
              darkMode={darkMode}
            />
          </div>

          {/* Management Panel */}
          <div
            className={`rounded-2xl border shadow-sm overflow-hidden p-6
          ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div
                className={`flex gap-1.5 overflow-x-auto p-1.5 rounded-xl ${darkMode ? "bg-gray-700/40" : "bg-slate-100/60"}`}
              >
                {(["users", "posts", "news", "slides"] as const).map((tab) => (
                  <TabButton
                    key={tab}
                    title={
                      tab === "users"
                        ? "ผู้ใช้"
                        : tab === "posts"
                          ? "โพสต์"
                          : tab === "news"
                            ? "ข่าวสาร"
                            : "สไลด์"
                    }
                    icon={
                      tab === "users" ? (
                        <FiUser />
                      ) : tab === "posts" ? (
                        <FiFileText />
                      ) : tab === "news" ? (
                        <FiRss />
                      ) : (
                        <FiSliders />
                      )
                    }
                    count={data[tab].length}
                    isActive={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                  />
                ))}
              </div>

              <div className="flex w-full lg:w-auto gap-3">
                <div className="relative flex-1 sm:w-72">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none ${darkMode ? "bg-gray-700 text-white placeholder-gray-400" : "bg-white text-slate-900 placeholder-slate-400"}`}
                  />
                </div>
                {(activeTab === "slides" || activeTab === "news") && (
                  <Link
                    href={
                      activeTab === "slides"
                        ? "/admin/manage-slides"
                        : "/admin/manage-news"
                    }
                  >
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl">
                      <FiPlus /> สร้างรายการ
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Dynamic Rendering Table */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={fader}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === "users" && (
                  <DynamicTable
                    headers={["ชื่อที่แสดง", "อีเมล", "จัดการ"]}
                    items={paginatedItems}
                    renderRow={(user, i) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 group"
                      >
                        <td className="px-6 py-4">
                          {editingId === user.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="p-2 border rounded bg-transparent text-slate-900 dark:text-slate-100"
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-600">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <span>{user.name}</span>
                              {user.role === "admin" && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-100 text-violet-700 rounded-full">
                                  Admin
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">{user.email || "N/A"}</td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          {editingId === user.id ? (
                            <>
                              <button
                                onClick={async () => {
                                  await supabase
                                    .from("profiles")
                                    .update({ name: editName.trim() })
                                    .eq("id", user.id);
                                  setData((prev) => ({
                                    ...prev,
                                    users: prev.users.map((u) =>
                                      u.id === user.id
                                        ? { ...u, name: editName }
                                        : u,
                                    ),
                                  }));
                                  setEditingId(null);
                                  toast.success("บันทึกสำเร็จ");
                                }}
                                className="p-2 text-emerald-600"
                              >
                                <FiSave />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-slate-400"
                              >
                                <FiXCircle />
                              </button>
                            </>
                          ) : user.role === "admin" &&
                            user.id !== currentUserId ? (
                            <span className="text-xs text-slate-400">
                              <FiLock /> ป้องกัน
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(user.id);
                                  setEditName(user.name);
                                }}
                                className="p-2 text-indigo-600"
                              >
                                <FiEdit />
                              </button>
                              {user.role !== "admin" && (
                                <button
                                  onClick={async () => {
                                    if (
                                      await handleConfirmAction(
                                        "โปรโมตผู้ใช้?",
                                        "ตั้งเป็นแอดมิน",
                                      )
                                    ) {
                                      await supabase
                                        .from("profiles")
                                        .update({ role: "admin" })
                                        .eq("id", user.id);
                                      setData((prev) => ({
                                        ...prev,
                                        users: prev.users.map((u) =>
                                          u.id === user.id
                                            ? { ...u, role: "admin" }
                                            : u,
                                        ),
                                      }));
                                      toast.success("แต่งตั้งสำเร็จ");
                                    }
                                  }}
                                  className="p-2 text-violet-600"
                                >
                                  <FiUserCheck />
                                </button>
                              )}
                              {user.id !== currentUserId && (
                                <button
                                  onClick={() => handleDelete("users", user.id)}
                                  className="p-2 text-red-600"
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  />
                )}

                {activeTab === "posts" && (
                  <DynamicTable
                    headers={["ID โพสต์", "ผู้โพสต์", "หัวข้อโพสต์", "จัดการ"]}
                    items={paginatedItems}
                    renderRow={(post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-6 py-4 font-mono text-xs">
                          {post.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {userMap.get(post.user_id) || "N/A"}
                        </td>
                        <td className="px-6 py-4">{post.title}</td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <Link
                            href={`/post_detail?id=${post.id}`}
                            target="_blank"
                          >
                            <button className="p-2 text-indigo-600">
                              <FiEye />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete("posts", post.id)}
                            className="p-2 text-red-600"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    )}
                  />
                )}

                {activeTab === "news" && (
                  <DynamicTable
                    headers={["รูปภาพ", "หัวข้อข่าว", "จัดการ"]}
                    items={paginatedItems}
                    renderRow={(item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-6 py-2">
                          <div className="w-16 h-12 rounded overflow-hidden bg-slate-100 flex items-center justify-center border">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt=""
                                width={64}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <FiFileText />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{item.title}</td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <Link href={`/admin/manage-news?edit=${item.id}`}>
                            <button className="p-2 text-indigo-600">
                              <FiEdit />
                            </button>
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete("news", item.id, "news_images")
                            }
                            className="p-2 text-red-600"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    )}
                  />
                )}

                {activeTab === "slides" && (
                  <DynamicTable
                    headers={["รูปภาพ", "หัวข้อสไลด์", "จัดการ"]}
                    items={paginatedItems}
                    renderRow={(slide) => (
                      <tr
                        key={slide.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-6 py-2">
                          <div className="w-24 h-12 rounded overflow-hidden bg-slate-100 flex items-center justify-center border">
                            {slide.image_url ? (
                              <Image
                                src={slide.image_url}
                                alt=""
                                width={96}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <FiImage />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {slide.title || (
                            <span className="italic text-slate-400">
                              (ไม่มีหัวข้อ)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <Link href={`/admin/manage-slides?edit=${slide.id}`}>
                            <button className="p-2 text-indigo-600">
                              <FiEdit />
                            </button>
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete("slides", slide.id, "hero_images")
                            }
                            className="p-2 text-red-600"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    )}
                  />
                )}

                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-2 rounded border disabled:opacity-40 dark:border-slate-700"
                  >
                    <FiChevronLeft />
                  </button>
                  <span className="text-sm">
                    หน้า{" "}
                    <span className="text-indigo-600 font-bold">
                      {currentPage}
                    </span>{" "}
                    จาก {totalPages || 1}
                  </span>
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 rounded border disabled:opacity-40 dark:border-slate-700"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
