"use client";

import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import Tilt from "react-parallax-tilt";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FiHeart,
  FiEdit,
  FiTrash2,
  FiMessageSquare,
  FiThumbsUp,
} from "react-icons/fi";
import { ThemeContext } from "../ThemeContext";

type PostCardProps = {
  postId: string;
  title: string;
  description: string;
  type: string;
  province: string;
  images: string[];
  onDelete: (postId: string) => void | Promise<void>;
  onFav: (postId: string) => void | Promise<void>;
  onLike: (postId: string, liked: boolean) => Promise<number>;
  currentUserId?: string | null;   
  ownerId: string;
  isFav?: boolean;
  isLiked?: boolean;
  likeCount?: number;
};

const PostCard = ({
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
}: PostCardProps) => {

  const { t } = useTranslation();
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);

  const imageSrc = images?.[0] || "/default-placeholder.png";
  const isOwner = currentUserId === ownerId;

  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);
  const [fav, setFav] = useState(isFav);
  const [updatingLike, setUpdatingLike] = useState(false);

  useEffect(() => {
    setLiked(isLiked);
    setLikes(likeCount);
    setFav(isFav);
  }, [isLiked, likeCount, isFav]);

  return (
    <Tilt tiltMaxAngleX={6} tiltMaxAngleY={6} scale={1.02}>
      <motion.div
        layout
        onClick={() => router.push(`/post_detail?id=${postId}`)}
        className={`
          cursor-pointer rounded-2xl overflow-hidden border
          transition-all duration-300
          ${
            darkMode
              ? "bg-gray-800 text-gray-100 border-gray-700 hover:border-pink-500"
              : "bg-white text-gray-900 border-gray-200 hover:border-blue-500"
          }
          shadow-md hover:shadow-xl
        `}
      >
        {/* IMAGE */}
        <div className="relative h-48">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onFav(postId);
              setFav((p) => !p);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/40"
          >
            <FiHeart
              className={`w-5 h-5 ${
                fav ? "text-red-500 fill-current" : "text-white"
              }`}
            />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 flex flex-col justify-between min-h-[170px]">
          <div>
            <div className="flex justify-between mb-2 text-xs">
              <span
                className={`px-2 py-1 rounded-full font-semibold ${
                  darkMode
                    ? "bg-pink-500/20 text-pink-400"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {type}
              </span>
              <span className="opacity-70">{province}</span>
            </div>

            <h3 className="font-bold text-lg truncate">{title}</h3>
            <p className="text-sm opacity-80 line-clamp-2 mt-1">
              {description}
            </p>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-300/20">
            <Link
              href={`/chat?id=${postId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm hover:underline"
            >
              <FiMessageSquare /> {t("joinchat")}
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (updatingLike) return;
                  setUpdatingLike(true);
                  const next = !liked;
                  setLiked(next);
                  setLikes((p) => (next ? p + 1 : p - 1));
                  try {
                    const count = await onLike(postId, next);
                    setLikes(count);
                  } finally {
                    setUpdatingLike(false);
                  }
                }}
                className="flex items-center gap-1 text-sm"
              >
                <FiThumbsUp
                  className={liked ? "text-blue-500 fill-current" : ""}
                />
                {likes}
              </button>

              {isOwner && (
                <>
                  <FiEdit
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/edit_post?id=${postId}`);
                    }}
                    className="cursor-pointer opacity-70 hover:opacity-100"
                  />
                  <FiTrash2
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(postId);
                    }}
                    className="cursor-pointer text-red-500"
                  />
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
