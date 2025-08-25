"use client";

import dynamic from "next/dynamic";

const PostPagesUI = dynamic(() => import("./postpage"), { ssr: false });

export default function Page() {
  return <PostPagesUI />;
}
