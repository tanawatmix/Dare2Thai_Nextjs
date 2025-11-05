"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Tilt from "react-parallax-tilt";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiHeart, FiEdit, FiTrash2, FiMessageSquare ,FiThumbsUp} from "react-icons/fi";

type PostCardProps = {
  postId: string;
  title: string;
  description: string;
  type: string;
  province: string;
  images: string[];
  onDelete: (postId: string) => Promise<void>;
  onFav: (postId: string) => Promise<void>;
  onLike: (postId: string, isLiked: boolean) => Promise<number>;
  currentUserId?: string;
  ownerId: string;
  isFav?: boolean;
  isLiked?: boolean;
  likeCount?: number;
};

const PostCard: React.FC<PostCardProps> = ({
  postId,
  title,
  description,
  type,
  province,
  images,
  onDelete,
  onFav,
  onLike,
  currentUserId,
  ownerId,
  isFav = false,
  isLiked = false,
  likeCount = 0,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const imageSrc = images?.[0] || "/default-placeholder.png";
  const isOwner = currentUserId === ownerId;

  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);
  const [updatingLike, setUpdatingLike] = useState(false);
  const [fav, setFav] = useState<boolean>(isFav);

  useEffect(() => {
    setLiked(isLiked);
    setLikes(likeCount);
    setFav(isFav);
  }, [isLiked, likeCount, isFav]);

  const handleViewDetail = () => router.push(`/post_detail?id=${postId}`);
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
    setFav((prev) => !prev); 
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (updatingLike) return; 
    setUpdatingLike(true);
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikes((prev) => (newLikedState ? prev + 1 : prev - 1));

    try { 
      const updatedLikeCount = await onLike(postId, newLikedState);
 
      setLikes(updatedLikeCount);
    } catch (error) {
      console.error("Failed to update like:", error); 
      setLiked(!newLikedState);
      setLikes((prev) => (newLikedState ? prev - 1 : prev + 1));
    } finally {
      setUpdatingLike(false);
    }
  };

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
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 ease-in-out group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {isOwner && (
            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
              {t("MyPost")}
            </span>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleFav}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full cursor-pointer hover:bg-white/30 transition-colors"
            >
              <FiHeart
                className={`w-5 h-5 transition-all ${
                  fav ? "text-red-500 fill-current" : "text-white"
                }`}
              />
            </motion.button>
          </div>
        </div>

        <div className="p-4 flex flex-col h-48 justify-between bg-gray-50 backdrop-blur-sm bg-opacity-10">
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
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/chat?id=${postId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
            >
              <FiMessageSquare /> <span>{t("joinchat")}</span>
            </Link>

            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                disabled={updatingLike}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Like"
              >
                <FiThumbsUp
                  className={`w-4 h-4 transition-all ${
                    liked ? "text-blue-500 fill-current" : ""
                  }`}
                />
                <span className="text-sm font-medium">{likes}</span>
              </motion.button>

              {isOwner && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEdit}
                    className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <FiEdit />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Delete"
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
