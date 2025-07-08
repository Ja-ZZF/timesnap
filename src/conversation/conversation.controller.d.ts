import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.entity';
export declare class ConversationController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    findAll(): Promise<Conversation[]>;
    findOne(id: string): Promise<Conversation>;
    create(conversation: Partial<Conversation>): Promise<Partial<Conversation> & Conversation>;
    getMessagePreviews(id: string): Promise<{
        avatar: string;
        name: string;
        message: string;
        conversationId: string;
    }[]>;
    getMessages(conversationId: string): Promise<{
        time: string;
        content: string;
        isImage?: boolean;
        user: {
            user_id: string;
            avatar: string;
            name: string;
        };
    }[]>;
    sendMessage(conversationId: string, body: {
        userId: string;
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
    postMessagePreviews(id: string): Promise<{
        avatar: string;
        name: string;
        message: string;
        conversationId: string;
    }[]>;
}
