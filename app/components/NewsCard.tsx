"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiEye } from "react-icons/fi";

export type NewsArticle = {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
};

type NewsCardProps = {
  article: NewsArticle;
  darkMode?: boolean;
  onClick: (id: string) => void;
  style?: React.CSSProperties;
};

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  darkMode = false,
  onClick,
  style,
}) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const imageSrc = article.image_url ?? "/dare2New.png";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={style}
      className={`rounded-xl overflow-hidden shadow-lg border transition-all duration-300 group cursor-pointer
        ${
          darkMode
            ? "bg-gray-800 border-gray-700 hover:border-pink-400/50 hover:shadow-pink-400/20"
            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-300/20"
        }`}
      onClick={() => onClick(article.id)}
    >
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/dare2New.png";
          }}
        />

        {/* overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

        {/* text overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-bold text-lg line-clamp-2">{article.title}</h3>
          <p className="text-xs text-gray-200 mt-1 line-clamp-2">
            {article.content}
          </p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-[10px] text-gray-300">
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-blue-300 font-medium group-hover:underline">
              อ่านต่อ <FiEye size={12} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard;