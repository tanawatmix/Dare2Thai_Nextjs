"use client";

import React from "react";

import Image from "next/image";

import Link from "next/link";

import Tilt from "react-parallax-tilt";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { FiHeart, FiEdit, FiTrash2, FiMessageSquare } from "react-icons/fi";

interface PostCardProps {
  images: string[];

  title: string;

  type: string;

  province: string;

  description: string;

  postId: string;

  ownerId: string; // user id ของเจ้าของโพสต์

  currentUserId: string | undefined; // user id ของผู้ใช้ปัจจุบัน (อาจจะยังไม่ล็อกอิน)

  onDelete: (postId: string) => void;

  onFav: (postId: string) => void;

  isFav?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  images,

  title,

  type,

  province,

  description,

  postId,

  ownerId,

  currentUserId,

  onDelete,

  onFav,

  isFav,
}) => {
  const router = useRouter();

  // ✅ FIX: สร้าง Logic ที่ปลอดภัยที่สุดสำหรับการเลือกรูปภาพ

  const imageSrc =
    images && Array.isArray(images) && images.length > 0 && images[0]
      ? images[0]
      : "/default-placeholder.png"; // **ต้องมีไฟล์นี้ในโฟลเดอร์ /public**

  const handleViewDetail = () => {
    router.push(`/post_detail?id=${postId}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // ป้องกันไม่ให้ handleViewDetail ทำงาน

    router.push(`/edit_post?id=${postId}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    onDelete(postId);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();

    onFav(postId);
  };

  // ✅ ตรวจสอบความเป็นเจ้าของอย่างปลอดภัย

  const isOwner = currentUserId && currentUserId === ownerId;

  return (
    <Tilt
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      scale={1.03}
      transitionSpeed={500}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        onClick={handleViewDetail}
        className="cursor-pointer rounded-xl overflow-hidden border dark:border-gray-700 shadow-md bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-2xl hover:border-blue-500/50 dark:hover:border-pink-500/50 group"
      >
        {/* --- Image Section --- */}

        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            layout="fill" // หรือใช้ fill={true} ใน Next.js v13+
            objectFit="cover"
            className="transition-transform duration-500 ease-in-out group-hover:scale-110"
            priority // เพิ่ม priority สำหรับรูปภาพที่สำคัญ (LCP)
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {isOwner && (
            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
              โพสต์ของคุณ
            </span>
          )}

          {/* Favorite */}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleFav}
            className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full cursor-pointer hover:bg-white/30 transition-colors"
            aria-label="Favorite"
          >
            <FiHeart
              className={`w-5 h-5 transition-all ${
                isFav ? "text-red-500 fill-current" : "text-white"
              }`}
            />
          </motion.button>
        </div>

        {/* Content */}

        <div className="p-4 flex flex-col h-48 justify-between bg-gray-50 backdrop-blur-sm bg-opacity-10  ">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 px-2 py-1 rounded-full">
                {type}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {province}
              </p>
            </div>

            <h3
              className="font-bold text-lg text-gray-900 dark:text-white truncate"
              title={title}
            >
              {title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 h-10 overflow-hidden text-ellipsis">
              {description}
            </p>
            <div className="flex items-center justify-end gap-3 my-2">
              {isOwner && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEdit}
                    className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Edit post"
                  >
                    <FiEdit />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label="Delete post"
                  >
                    <FiTrash2 />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Actions */}

          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/chat?id=${postId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
            >
              <FiMessageSquare /> <span>เข้าห้องแชท</span>
            </Link>

            {/* <div className="flex items-center gap-3">
              {isOwner && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEdit}
                    className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <FiEdit />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <FiTrash2 />
                  </motion.button>
                </>
              )}
            </div> */}
          </div>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default PostCard;
