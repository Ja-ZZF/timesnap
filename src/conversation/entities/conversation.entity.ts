// src/conversation/entities/conversation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({name : 'conversation'})
export class Conversation{
    @PrimaryGeneratedColumn()
    conversation_id:number;

    @Column()
    title:string

    @CreateDateColumn({type: 'datetime'})
    create_time : Date;
}