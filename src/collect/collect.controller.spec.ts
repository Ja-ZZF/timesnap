import { Test, TestingModule } from '@nestjs/testing';
import { CollectController } from './collect.controller';

describe('CollectController', () => {
  let controller: CollectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectController],
    }).compile();

    controller = module.get<CollectController>(CollectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
