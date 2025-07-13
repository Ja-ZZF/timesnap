// src/comment/dto/create-comment.dto.ts


export class CreateCommentDto {
  post_id : number;
  parent_comment_id : number | null;
  content : string;
}
