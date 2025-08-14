"use client";

import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import mockPosts from "../mock/mockPost";

// Mock Users
const mockUsers = [
  { id: 1, username: "user1", email: "user1@mail.com" },
  { id: 2, username: "user2", email: "user2@mail.com" },
  { id: 3, username: "user3", email: "user3@mail.com" },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
  exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
};

const tableFade = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } },
};

export default function AdminPage() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: "", email: "" });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setUsers(mockUsers);
    setPosts(mockPosts);
  }, []);

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditUserData({ username: user.username, email: user.email });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditUserData({ username: "", email: "" });
  };

  const handleSaveEdit = () => {
    if (!editUserData.username.trim() || !editUserData.email.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUserId
          ? { ...u, username: editUserData.username, email: editUserData.email }
          : u
      )
    );
    setEditingUserId(null);
    showNotification("แก้ไขข้อมูลผู้ใช้สำเร็จ");
  };

  const handleDeleteUser = (userId) => {
    if (confirm("ต้องการลบผู้ใช้นี้ใช่หรือไม่?")) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setPosts((prev) => prev.filter((p) => p.userId !== userId));
      showNotification("ลบผู้ใช้และโพสต์สำเร็จ");
    }
  };

  const handleDeletePost = (postId) => {
    if (confirm("ต้องการลบโพสต์นี้ใช่หรือไม่?")) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showNotification("ลบโพสต์สำเร็จ");
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen p-6  ${darkMode ? "bg-black" : "bg-white "}`}
    >
      <div className="flex items-center  mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-2xl font-bold"
        >
          Admin Page
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-red-500 text-white rounded p-2  m-10"
          onClick={() => (window.location.href = "/")}
        >
          กลับหน้าหลัก
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-500 text-white rounded p-2 mr-10"
          onClick={() => (window.location.href = "/game")}
        >
          คลายเครียด
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className={` p-2 rounded font-bold ${
            darkMode ? "bg-green-400 text-white" : "bg-blue-400 text-white"
          }`}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </motion.button>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <Section title="จัดการผู้ใช้">
        <DataTable
          users={users}
          editingUserId={editingUserId}
          editUserData={editUserData}
          handleEditClick={handleEditClick}
          handleCancelEdit={handleCancelEdit}
          handleSaveEdit={handleSaveEdit}
          handleDeleteUser={handleDeleteUser}
          setEditUserData={setEditUserData}
        />
      </Section>

      {/* Posts Table */}
      <Section title="จัดการโพสต์">
        <PostTable
          posts={posts}
          users={users}
          handleDeletePost={handleDeletePost}
        />
      </Section>
    </motion.div>
  );
}

const Section = ({ title, children }) => (
  <section className="mb-12">
    <motion.h2
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="text-xl font-semibold mb-4"
    >
      {title}
    </motion.h2>
    {children}
  </section>
);

const DataTable = ({
  users,
  editingUserId,
  editUserData,
  handleEditClick,
  handleCancelEdit,
  handleSaveEdit,
  handleDeleteUser,
  setEditUserData,
}) => (
  <motion.div
    key="users-table"
    variants={tableFade}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow p-4"
  >
    <table className="w-full table-auto border-collapse border border-gray-300 ">
      <thead>
        <tr className="bg-blue-200 dark:bg-pink-400 text-white">
          <th className="border px-4 py-2">ID</th>
          <th className="border px-4 py-2">ชื่อผู้ใช้</th>
          <th className="border px-4 py-2">อีเมล</th>
          <th className="border px-4 py-2">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center p-4">
              ไม่มีผู้ใช้
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
                className="odd:bg-gray-50 text-white dark:odd:bg-gray-700"
                layout
              >
                <td className="border px-4 py-2 text-center">{user.id}</td>
                <td className="border px-4 py-2">
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      value={editUserData.username}
                      onChange={(e) =>
                        setEditUserData({
                          ...editUserData,
                          username: e.target.value,
                        })
                      }
                      className="w-full p-1 rounded border"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="border px-4 py-2">
                  {editingUserId === user.id ? (
                    <input
                      type="email"
                      value={editUserData.email}
                      onChange={(e) =>
                        setEditUserData({
                          ...editUserData,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-1 rounded border"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="border px-4 py-2 text-center space-x-2">
                  {editingUserId === user.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        ลบ
                      </button>
                    </>
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

const PostTable = ({ posts, users, handleDeletePost }) => (
  <motion.div
    key="posts-table"
    variants={tableFade}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow p-4"
  >
    <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
      <thead>
        <tr className="bg-blue-200 dark:bg-pink-400 text-black dark:text-white">
          <th className="border px-4 py-2">ID</th>
          <th className="border px-4 py-2">ผู้ใช้</th>
          <th className="border px-4 py-2">หัวข้อโพสต์</th>
          <th className="border px-4 py-2">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {posts.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center p-4">
              ไม่มีโพสต์
            </td>
          </tr>
        ) : (
          posts.map((post, i) => {
            const user = users.find((u) => u.id === post.userId);
            return (
              <motion.tr
                key={post.id}
                custom={i}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="odd:bg-gray-50 text-white dark:odd:bg-gray-700"
                layout
              >
                <td className="border px-4 py-2 text-center">{post.id}</td>
                <td className="border px-4 py-2">
                  {user ? user.username : "ไม่พบผู้ใช้"}
                </td>
                <td className="border px-4 py-2">{post.title}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    ลบ
                  </button>
                </td>
              </motion.tr>
            );
          })
        )}
      </tbody>
    </table>
  </motion.div>
);
