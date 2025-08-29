"use client";

import React from "react";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // ลบ Toaster ออก

interface PostCardProps {
  images: string[];
  title: string;
  type: string;
  province: string;
  description: string;
  postId: number; // เปลี่ยนเป็น number ตาม mock data
  onEdit?: (postId: number) => void;
  onDelete: (postId: number) => void;
  onFav?: (postId: number) => void;
  isFav?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  images,
  title,
  type,
  province,
  description,
  postId,
  onEdit,
  onDelete,
  onFav,
  isFav,
}) => {
  const router = useRouter();

  const imageSrc =
    images && images.length > 0 ? images[0] : "/default-placeholder.png";

  const handleViewDetail = () => {
    router.push(`/post_detail?id=${postId}`);
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onEdit) onEdit(postId);
    router.push(`/edit_post?id=${postId}`);
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(postId);
  };

  const handleFav = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onFav) {
      onFav(postId);
    }
  };

  return (
    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={400}>
      <div
        onClick={handleViewDetail}
        className="cursor-pointer rounded-xl overflow-hidden border shadow-md bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg"
      >
        <Image
          src={imageSrc}
          alt={title}
          width={400}
          height={250}
          className="object-cover w-full h-60"
          priority
        />
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {description}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>{type}</span> • <span>{province}</span>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleFav}
              className={`px-3 py-1 rounded-md text-sm flex items-center font-semibold transition ${
                isFav
                  ? "bg-yellow-400 text-white shadow-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300"
              }`}
              aria-label="Favorite"
            >
              {isFav ? "★ Fav" : "☆ Fav"}
            </button>
            <button
              onClick={handleEdit}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              แก้ไข
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 dark:text-red-400 hover:underline text-sm"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </Tilt>
  );
};

export default PostCard;