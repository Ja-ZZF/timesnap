// src/comment/dto/create-comment.dto.ts
import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNumber()
  post_id: number;

  @IsOptional()
  @IsNumber()
  parent_comment_id?: number;

  @IsNumber()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
