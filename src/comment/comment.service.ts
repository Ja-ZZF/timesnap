// src/comment/comment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  create(comment: Partial<Comment>) {
    return this.commentRepo.save(comment);
  }

  findAll(): Promise<Comment[]> {
    return this.commentRepo.find();
  }

  findByTarget(type: 'Post' | 'Comment', id: number): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { target_type: type, target_id: id },
    });
  }

  remove(id: number) {
    return this.commentRepo.delete(id);
  }
}
