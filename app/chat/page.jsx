"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import React from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

const ChatUI = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "ไม่ทราบชื่อโพสต์";
  const { darkMode } = useContext(ThemeContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);

  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // เลื่อนแค่กล่องแชทเมื่อข้อความเปลี่ยน
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // ตรวจสอบว่าจะแสดงปุ่ม scroll หรือไม่
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 10;
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
    setShowScrollButton(false);
  };

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        type: "text",
        content: input,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    }
  };

  const handleMediaSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const mediaUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video/");
      const type = isVideo ? "video" : "image";
      const newMessage = {
        type,
        content: mediaUrl,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="font-sriracha relative bg-fixed bg-center bg-cover transition duration-500 flex-1"
      style={{
        backgroundImage: `url(${darkMode ? "/bp.jpg" : "/whiteWater.jpg"})`,
      }}
    >
      <Navbar />

      <div className="flex-grow px-4 py-20 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4 text-secondary dark:text-primary">
          {t("Chatfor")} : {title}
        </h1>

        <div className="relative">
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="bg-white rounded shadow border border-blue-400 dark:border-pink-400 h-96 overflow-y-auto p-4 mb-4"
          >
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">{t("Nomessage")}</p>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-2 text-right"
                >
                  <div>
                    {msg.type === "text" ? (
                      <div className="inline-block bg-pink-300 text-white px-3 py-1 rounded-lg">
                        {msg.content}
                      </div>
                    ) : msg.type === "image" ? (
                      <div className="inline-block bg-pink-100 p-1 rounded-lg">
                        <img
                          src={msg.content}
                          alt="ส่งรูป"
                          className="max-w-xs max-h-48 rounded"
                        />
                      </div>
                    ) : (
                      <div className="inline-block bg-pink-100 p-1 rounded-lg">
                        <video
                          src={msg.content}
                          controls
                          className="max-w-xs max-h-48 rounded"
                        />
                      </div>
                    )}
                  </div>
                  {msg.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {showScrollButton && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToBottom}
              className="absolute bottom-6 right-4 bg-blue-400 dark:bg-pink-400 text-white rounded-full p-2 shadow-lg hover:bg-pink-400 dark:hover:bg-blue-400"
              aria-label="Scroll to bottom"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.button>
          )}
        </div>

        <div className="flex gap-2 text-black items-center">
          <input
            type="text"
            placeholder="พิมพ์ข้อความ..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-2 border bg-white border-blue-400 dark:border-pink-400 rounded"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className="bg-blue-400 dark:bg-pink-400 text-white px-4 py-2 rounded hover:bg-pink-500 dark:hover:bg-blue-400"
          >
            <Image src="/send.png" alt="ส่ง" width={24} height={24} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-400 dark:bg-pink-400 px-4 py-2 rounded hover:bg-pink-500 dark:hover:bg-blue-400"
            type="button"
          >
            <img src="/pic.png" alt="เลือกรูป" width={24} height={24} />
          </motion.button>

          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleMediaSelect}
            style={{ display: "none" }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="mt-6 border border-pink-400 w-full bg-white font-bold text-black hover:scale-105 py-2 rounded"
        >
          {t("back")}
        </motion.button>
      </div>
      <Footer />
    </motion.div>
  );
};

export default ChatUI;
