import { Test, TestingModule } from '@nestjs/testing';
import { ChatMessageController } from './chat_message.controller';

describe('ChatMessageController', () => {
  let controller: ChatMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatMessageController],
    }).compile();

    controller = module.get<ChatMessageController>(ChatMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
