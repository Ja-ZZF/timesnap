// src/user-action/entities/user-action.entity.ts

import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn } from 'typeorm';
export enum ActionEnum {
  View = 'view',
  Like = 'like',
  Collect = 'collect',
  Share = 'share',
  Comment = 'comment',
}

@Entity({ name: 'user_action' })
export class UserAction {
  @PrimaryGeneratedColumn({ name: 'action_id' })
  action_id: number;

  @Column({ name: 'user_id'})
  user_id: number;

  @Column({ name: 'post_id'})
  post_id: number;

  @Column({
    name: 'action_type',
    type: 'enum',
    enum: ActionEnum,
  })
  action_type: ActionEnum;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at: Date;
}