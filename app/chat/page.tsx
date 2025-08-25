"use client";


import dynamic from "next/dynamic";

// ปิด SSR สำหรับ ChatUI
const ChatUI = dynamic(() => import("./chat"), { ssr: false });

export default function Page() {
  return <ChatUI />;
}
