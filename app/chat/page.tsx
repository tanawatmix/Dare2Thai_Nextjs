import ChatUI from "./chat"; // ตรวจสอบว่า path ไปยัง component ของคุณถูกต้อง

// ✅ คำสั่งสำคัญที่สุด: บอก Next.js ให้โหลดหน้านี้ใหม่สดๆ ทุกครั้ง
export const dynamic = 'force-dynamic';

export default function ChatPage() {
  // หน้านี้จะทำหน้าที่แค่แสดงผล ChatUI Component เท่านั้น
  return <ChatUI />;
}