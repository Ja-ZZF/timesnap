// dto/create-chat-message.dto.ts
export class CreateChatMessageDto {
  contact_id: number;
  sender_id: number;
  content: string;
  message_type?: 'text' | 'image' | 'video' | 'audio';
}
