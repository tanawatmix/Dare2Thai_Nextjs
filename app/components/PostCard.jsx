"use client";

import React from "react";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import { useRouter } from "next/navigation";

const PostCard = ({
  images,
  title,
  type,
  province,
  description,
  postId,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  const imageSrc =
    images && images.length > 0 ? images[0] : "/default-placeholder.png";

  // เพิ่มฟังก์ชันเมื่อคลิกที่การ์ด จะพาไปหน้าโพสต์รายละเอียด
  const handleViewDetail = () => {
    router.push(`/post_detail?id=${postId}`); // สมมติหน้า detail ชื่อ post_detail.jsx
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // ป้องกันไม่ให้ trigger handleViewDetail ด้วย
    router.push(`/edit_post?id=${postId}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(postId);
  };

  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      scale={1.02}
      transitionSpeed={400}
    >
      <div
        onClick={handleViewDetail}
        className="cursor-pointer rounded-xl overflow-hidden border shadow-md bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg"
      >
        <Image
          src={
            images && images.length > 0 ? images[0] : "/dare2New.png"
          }
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
