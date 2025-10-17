// lib/supabaseClient.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

// ฟังก์ชันนี้ไม่ต้องใส่ URL และ Key เพราะมันถูกออกแบบมา
// ให้อ่านจาก Environment Variables โดยอัตโนมัติ
export const supabase = createPagesBrowserClient()