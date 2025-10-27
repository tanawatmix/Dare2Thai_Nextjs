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
  ownerId: string;
  currentUserId: string | undefined;
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

  const imageSrc =
    images && Array.isArray(images) && images.length > 0 && images[0]
      ? images[0]
      : "/default-placeholder.png";

  const handleViewDetail = () => {
    router.push(`/post_detail?id=${postId}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const isOwner = currentUserId && currentUserId === ownerId;

  return (
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1} transitionSpeed={500}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={handleViewDetail}
        className="cursor-pointer rounded-xl overflow-hidden border dark:border-gray-700 shadow-md bg-white dark:bg-gray-800 transition-all duration-200"
      >
        {/* Image Section (no extra highlights/gradients or hover zoom) */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            layout="fill"
            objectFit="cover"
            className=""
          />

          {/* Simple favorite button (no background highlight) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFav}
            className="absolute top-3 right-3 p-2 rounded-full cursor-pointer"
            aria-label="Favorite"
          >
            <FiHeart
              className={`w-5 h-5 ${isFav ? "text-red-500" : "text-white"}`}
            />
          </motion.button>
        </div>

        {/* Content (removed pill highlight and gradients) */}
        <div className="p-4 flex flex-col h-48 justify-between bg-transparent">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded">
                {type}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {province}
              </p>
            </div>
            <h3
              className="font-semibold text-lg text-gray-900 dark:text-white truncate"
              title={title}
            >
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 h-10 overflow-hidden text-ellipsis">
              {description}
            </p>
          </div>

          {/* Actions (kept functionality, owner controls remain but without extra emphasis) */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/chat?id=${postId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-blue-500"
            >
              <FiMessageSquare /> <span>เข้าห้องแชท</span>
            </Link>

            <div className="flex items-center gap-3 text-gray-600">
              {isOwner && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className="text-gray-600"
                  >
                    <FiEdit />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="text-gray-600"
                  >
                    <FiTrash2 />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default PostCard;
