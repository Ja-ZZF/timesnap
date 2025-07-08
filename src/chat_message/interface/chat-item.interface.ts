import { UserItem } from "src/user/interface/user-item.interface";

export interface ChatItem {
  time: string;
  content: string;
  isImage?: boolean;
  user: UserItem
}