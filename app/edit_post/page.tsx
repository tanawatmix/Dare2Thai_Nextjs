"use client";

import dynamic from "next/dynamic";

const EditPostUI = dynamic(() => import("./editPost"), { ssr: false });

export default function Page() {
  return <EditPostUI />;
}
