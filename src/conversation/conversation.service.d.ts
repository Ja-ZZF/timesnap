import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../user/entities/user.entity';
export declare class ConversationService {
    private readonly ConversationRepo;
    private readonly MessageRepo;
    private readonly UserRepo;
    constructor(ConversationRepo: Repository<Conversation>, MessageRepo: Repository<Message>, UserRepo: Repository<User>);
    create(conversation: Partial<Conversation>): Promise<Partial<Conversation> & Conversation>;
    findAll(): Promise<Conversation[]>;
    findOne(id: number): Promise<Conversation | null>;
    getMessagePreviews(userId: number): Promise<{
        avatar: string;
        name: string;
        message: string;
        conversationId: string;
    }[]>;
    getMessagesByConversationId(conversationId: number): Promise<{
        time: string;
        content: string;
        isImage?: boolean;
        user: {
            user_id: string;
            avatar: string;
            name: string;
        };
    }[]>;
    sendMessage({ conversationId, userId, content, isImage, }: {
        conversationId: number;
        userId: number;
        content: string;
        isImage?: boolean;
    }): Promise<{
        time: string;
        content: string;
        isImage: boolean;
        user: {
            user_id: string;
            avatar: string;
            name: string;
        };
    }>;
}
