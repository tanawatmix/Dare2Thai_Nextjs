"use client";

import {
  useState,
  useEffect,
  useRef,
  useContext,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiImage,
  FiSend,
  FiX,
  FiDownload,
  FiArrowLeft,
  FiArrowDown,
  FiTrash2,
  FiMoreHorizontal,
  FiCornerUpLeft,
} from "react-icons/fi";

// --- Type Definitions (อัปเดต) ---
export interface ChatMessage {
  id: string; // ✅ FIX: id เป็น string (uuid)
  created_at: string;
  post_id: string;
  user_id: string;
  username: string; // (โค้ดคุณใช้ username ซึ่งเก็บ 'name'ไว้)
  message: string;
  image_url?: string;
  reply_to_id?: string | null;
  reply_to_message?: string | null;
  reply_to_username?: string | null;
}
type Profile = {
  username: string;
  name: string;
};

// --- Loading Component ---
const LoadingComponent = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <svg
      className="animate-spin h-8 w-8 mb-4 text-blue-500"
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p className="text-lg text-[var(--foreground)] opacity-80">{text}</p>
  </div>
);

// --- Main Chat Component ---
const ChatUI = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { darkMode } = useContext(ThemeContext);
  
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [postTitle, setPostTitle] = useState<string>("กำลังโหลด...");
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [highlightedMsg, setHighlightedMsg] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const postId = searchParams.get("id") || "";
  const prevScrollHeightRef = useRef<number>(0);

  // --- Data Fetching & Auth ---
  useEffect(() => {
    const setupPage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        const [profileRes, postRes, messagesRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("username, name")
            .eq("id", user.id)
            .single(),
          supabase.from("posts").select("title").eq("id", postId).single(),
          supabase
            .from("chats")
            .select(`*`)
            .eq("post_id", postId)
            .order("created_at", { ascending: true }),
        ]);

        if (profileRes.data) setProfile(profileRes.data as Profile);
        if (postRes.data) setPostTitle(postRes.data.title);
        else setPostTitle("ไม่พบโพสต์");
        if (messagesRes.data) setMessages(messagesRes.data as any[] as ChatMessage[]);
      }
      setIsLoading(false);
    };
    if (postId) {
      setupPage();
    } else {
      setIsLoading(false);
      setPostTitle("ไม่พบ ID ของโพสต์");
    }
  }, [postId]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  // Realtime
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`realtime-chats-${postId}`)
      .on<ChatMessage>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          setMessages((currentMessages) => [...currentMessages, payload.new]);
        }
      )
      .on<ChatMessage>(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chats",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          setMessages((currentMessages) =>
            currentMessages.filter(
              (msg) => msg.id !== (payload.old as ChatMessage).id
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  // Scroll to bottom Logic
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const wasAtBottom =
        prevScrollHeightRef.current - clientHeight <= scrollTop + 150;

      setTimeout(() => {
        if (chatContainerRef.current) {
          if (wasAtBottom) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
          prevScrollHeightRef.current = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  // --- Handlers ---
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async () => {
    const messageText = input.trim();
    if (!messageText && !imageFile) return;
    if (!user || !profile?.name) return;

    setIsSending(true);
    let imageUrl: string | undefined = undefined;

    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const filePath = `public/${postId}/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat_images")
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        setIsSending(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("chat_images")
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }

    const messageToSend = {
      post_id: postId,
      user_id: user.id,
      username: profile.name, // ใช้ "name"
      message: messageText,
      image_url: imageUrl,
      reply_to_id: replyingTo ? replyingTo.id : null,
      reply_to_message: replyingTo ? (replyingTo.message || (replyingTo.image_url ? "[รูปภาพ]" : null)) : null,
      reply_to_username: replyingTo ? replyingTo.username : null,
    };

    await supabase.from("chats").insert(messageToSend);

    setInput("");
    clearImage();
    setReplyingTo(null);
    setIsSending(false);
  };

  const handleDownloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReplyClick = (message: ChatMessage) => {
    setReplyingTo(message);
    setActiveMenu(null);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteMessage = async (message: ChatMessage) => {
    if (!user || user.id !== message.user_id) return;
    
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อความนี้?")) {
        setActiveMenu(null);
        setMessages((prev) => prev.filter((m) => m.id !== message.id));

        if (message.image_url) {
          try {
            const filePath = message.image_url.split("/chat_images/")[1];
            if (filePath) {
              await supabase.storage.from("chat_images").remove([filePath]);
            }
          } catch (storageError) {
             console.error("Error deleting image from storage:", storageError);
          }
        }
        
        const { error } = await supabase.from("chats").delete().eq("id", message.id);
        if (error) {
          console.error("Error deleting message:", error);
        }
    }
  };
  
  const handleScrollToReply = (messageId: string | undefined | null) => {
    if (!messageId) return;

    const element = document.getElementById(`message-${messageId}`);
    if (element && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: element.offsetTop - chatContainerRef.current.offsetTop,
        behavior: 'smooth'
      });
      
      setHighlightedMsg(messageId);
      setTimeout(() => {
        setHighlightedMsg(null);
      }, 2000);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      if (scrollHeight - scrollTop - clientHeight > 300) {
        setShowScrollToBottom(true);
      } else {
        setShowScrollToBottom(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) return <LoadingComponent text="กำลังโหลดห้องแชท..." />;
  if (!user) return <LoadingComponent text="กำลังนำไปที่หน้าล็อกอิน..." />;

  return (
    <div
      className={`font-sriracha transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full px-4 pt-24 pb-4 ">
        <motion.div
          onClick={() => activeMenu && setActiveMenu(null)}
          className={`w-full max-w-4xl h-[calc(112vh-180px)] mt-[-15px] flex flex-col shadow-2xl border border-black/10 dark:border-white/10 ${darkMode ? "bg-gray-800 " : "bg-gray-50 "}`}
        >
          {/* Chat Header */}
          <div className={`flex items-center gap-4 py-3 px-4 border-b border-black/10 dark:border-white/10 ${darkMode ? "bg-gray-800 text-white" : "bg-gray-50"}`}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 bg-white/30 hover:bg-white/50 rounded-md flex items-center justify-center shadow-sm"
              aria-label="ย้อนกลับ"
            >
              <FiArrowLeft />
            </motion.button>
            <h1
              className={`text-lg md:text-xl font-extrabold truncate ${darkMode ? "text-white" : "text-black"}`}
              title={postTitle}
            >
              {postTitle}
            </h1>
          </div>

          {/* Messages Area Wrapper */}
          <div className="flex-1 relative">
            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="absolute inset-0 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    id={`message-${msg.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`relative flex items-end gap-2 group w-full transition-colors
                      ${ msg.user_id === user.id ? "justify-end" : "justify-start" }
                      ${ highlightedMsg === msg.id ? `${darkMode ? "bg-blue-200 dark:bg-blue-900/50 h-56 " : "bg-pink-100 dark:bg-pink-900/50 h-56 "}` : "" }
                    `}
                  >
                    {/* --- ปุ่ม 3 จุด (อยู่ข้างแชท) --- */}
                   <div className="relative flex-shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === msg.id ? null : msg.id)
                        }}
                        className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiMoreHorizontal />
                      </button>
                      <AnimatePresence>
                        {activeMenu === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute bottom-full mb-1 w-40 bg-white dark:bg-gray-900 shadow-xl rounded-lg border border-black/10 dark:border-white/10 z-10 overflow-hidden
                              ${ msg.user_id === user.id ? "right-0" : "left-0" }
                            `}
                          >
                            <button 
                              onClick={() => handleReplyClick(msg)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <FiCornerUpLeft size={16} /> <span>ตอบกลับ</span>
                            </button>
                            {msg.user_id === user.id && (
                              <button 
                                onClick={() => handleDeleteMessage(msg)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50"
                              >
                                <FiTrash2 size={16} /> <span>ลบข้อความ</span>
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* --- กล่องข้อความ (Bubble) --- */}
                    <div
                      className={`flex flex-col ${
                        msg.user_id === user.id ? "items-right" : "items-start"
                      }`}
                    >
                      <div
                        className={`flex items-baseline gap-2 ${
                          msg.user_id === user.id ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <strong
                          className={`text-sm font-bold ${
                            msg.user_id === user.id
                              ? `${darkMode ? "text-blue-400" : "text-pink-400"}`
                              : `${darkMode ? "text-white" : "text-black"}`
                          }`}
                        >
                          {msg.username}
                        </strong>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.created_at.replace(' ', 'T') + 'Z').toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })}</span>
                      </div>
                      <div
                        className={`mt-1 max-w-xs md:max-w-md w-fit rounded-lg shadow-md ${
                          msg.image_url && !msg.message
                            ? "p-1 bg-transparent dark:bg-transparent"
                            : "p-3"
                        } ${
                          msg.user_id === user.id
                            ? `${darkMode ? "bg-blue-500" : "bg-pink-500"} rounded-br-none `
                            : "bg-gray-200 dark:bg-gray-700 rounded-bl-none"
                        }`}
                      >
                        {/* บล็อกตอบกลับที่คลิกได้ */}
                        {msg.reply_to_id && (
                          <div 
                            className={`${darkMode ? "border-blue-300" : "border-pink-400"} p-2 mb-2 border-l-4 bg-black/10 dark:bg-white/10 rounded-md cursor-pointer hover:bg-black/20 dark:hover:bg-white/20`}
                            onClick={() => handleScrollToReply(msg.reply_to_id)}
                          >
                            <p className="font-bold text-xs opacity-80 text-gray-800 dark:text-gray-100">
                              ตอบกลับ {msg.reply_to_username}
                            </p>
                            <p className="text-sm opacity-90 text-gray-700 dark:text-gray-200 truncate">
                              {msg.reply_to_message || "[รูปภาพ]"}
                            </p>
                          </div>
                        )}
                        
                        {msg.message && (
                          <p
                            className={`text-sm ${
                              msg.user_id === user.id
                                ? "text-white"
                                : "text-gray-800 dark:text-gray-100"
                            }`}
                          >
                            {msg.message}
                          </p>
                        )}
                        {msg.image_url && (
                          <div
                            className={`rounded-lg overflow-hidden ${
                              msg.message ? "mt-2" : ""
                            }`}
                            onClick={() => setViewingImage(msg.image_url!)}
                          >
                            <Image
                              src={msg.image_url}
                              alt="Chat image"
                              width={300}
                              height={300}
                              className="object-cover w-full h-auto max-h-[300px] cursor-pointer transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {/* ปุ่ม Scroll to Bottom */}
            <AnimatePresence>
              {showScrollToBottom && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={scrollToBottom}
                  className={`${darkMode ? "bg-blue-500 hover:bg-blue-600" : "bg-pink-500 hover:bg-pink-600"} absolute bottom-4 right-4 z-10 text-white rounded-full h-10 w-10 flex items-center justify-center shadow-lg transition-colors`}
                  aria-label="Scroll to bottom"
                >
                  <FiArrowDown size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t border-black/10 dark:border-white/10 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-xs font-bold ${darkMode ? "text-blue-500" : "text-pink-400"}`}>
                        กำลังตอบกลับ: {replyingTo.username}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                        {replyingTo.message || "[รูปภาพ]"}
                      </p>
                    </div>
                    <button 
                      onClick={cancelReply}
                      className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <FiX />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative w-24 h-24 mb-4"
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full rounded-md object-cover"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs shadow-lg"
                  >
                    <FiX />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <FiImage />
              </motion.button>
              <input
                type="text"
                className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pink-500"
                placeholder="พิมพ์ข้อความ..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSendMessage}
                disabled={isSending || (!input.trim() && !imageFile)}
                className={`${darkMode ? "bg-blue-500 hover:bg-blue-600" : "bg-pink-500 hover:bg-pink-600"} text-white p-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FiSend />
              </motion.button>
            </div>
          </div>

        </motion.div>
      </main>

      <Footer />

      {/* Lightbox/Modal for Viewing Image */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setViewingImage(null)}
          >
            <motion.div
              layoutId={viewingImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-auto h-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={viewingImage}
                alt="Enlarged view"
                width={1200}
                height={800}
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDownloadImage(viewingImage)}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg hover:bg-blue-600 transition-colors"
              >
                <FiDownload /> <span>ดาวน์โหลด</span>
              </motion.button>
            </motion.div>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 bg-white/20 text-white backdrop-blur-md rounded-full h-10 w-10 flex items-center justify-center text-xl shadow-lg hover:bg-white/30"
            >
              <FiX />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatUI;