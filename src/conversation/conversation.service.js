"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
const user_entity_1 = require("../user/entities/user.entity");
let ConversationService = class ConversationService {
    ConversationRepo;
    MessageRepo;
    UserRepo;
    constructor(ConversationRepo, MessageRepo, UserRepo) {
        this.ConversationRepo = ConversationRepo;
        this.MessageRepo = MessageRepo;
        this.UserRepo = UserRepo;
    }
    async create(conversation) {
        return this.ConversationRepo.save(conversation);
    }
    async findAll() {
        return this.ConversationRepo.find();
    }
    findOne(id) {
        return this.ConversationRepo.findOne({
            where: { conversation_id: id },
        });
    }
    async getMessagePreviews(userId) {
        try {
            const conversations = await this.ConversationRepo.find();
            const previews = [];
            for (const conv of conversations) {
                const latestMsg = await this.MessageRepo.findOne({
                    where: { conversation_id: conv.conversation_id },
                    order: { send_time: 'DESC' },
                });
                if (!latestMsg)
                    continue;
                const user = await this.UserRepo.findOne({ where: { user_id: latestMsg.user_id } });
                if (!user)
                    continue;
                previews.push({
                    avatar: user.avatar,
                    name: user.nickname,
                    message: latestMsg.content,
                    conversationId: String(conv.conversation_id),
                });
            }
            return previews;
        }
        catch (err) {
            console.error('getMessagePreviews error:', err);
            throw err;
        }
    }
    async getMessagesByConversationId(conversationId) {
        const messages = await this.MessageRepo.find({
            where: { conversation_id: conversationId },
            order: { send_time: 'ASC' },
        });
        const result = [];
        for (const msg of messages) {
            const user = await this.UserRepo.findOne({ where: { user_id: msg.user_id } });
            if (!user)
                continue;
            result.push({
                time: msg.send_time.toISOString(),
                content: msg.content,
                isImage: msg.is_image ?? false,
                user: {
                    user_id: String(user.user_id),
                    avatar: user.avatar,
                    name: user.nickname,
                },
            });
        }
        return result;
    }
    async sendMessage({ conversationId, userId, content, isImage, }) {
        const message = this.MessageRepo.create({
            conversation_id: conversationId,
            user_id: userId,
            content,
            is_image: isImage ?? false,
        });
        await this.MessageRepo.save(message);
        const user = await this.UserRepo.findOne({ where: { user_id: userId } });
        return {
            time: message.send_time?.toISOString() ?? new Date().toISOString(),
            content: message.content,
            isImage: message.is_image,
            user: {
                user_id: String(user?.user_id ?? userId),
                avatar: user?.avatar ?? '',
                name: user?.nickname ?? '',
            },
        };
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map