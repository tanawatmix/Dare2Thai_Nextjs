// types/chat.ts
export interface ChatMessage {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}