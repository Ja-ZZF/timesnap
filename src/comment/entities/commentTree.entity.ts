export interface CommentTree extends Comment {
  user: {
    user_id: number;
    nickname: string;
    avatar: string;
  } | null;
  children: CommentTree[];
}
