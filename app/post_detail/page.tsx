"use client";
// /app/post_detail/page.tsx
import dynamic from "next/dynamic";
import { Suspense } from "react";

const PostDetailsUI = dynamic(() => import("./postdetail"), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostDetailsUI />
    </Suspense>
  );
}
