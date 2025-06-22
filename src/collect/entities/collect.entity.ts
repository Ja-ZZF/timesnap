import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Collect {
  @PrimaryGeneratedColumn()
  collect_id: number;

  @Column()
  user_id: number;

  @Column()
  post_id: number;

  @CreateDateColumn({ type: 'datetime' })
  collect_time: Date;
}
