import { Test, TestingModule } from '@nestjs/testing';
import { UserActionController } from './user-action.controller';

describe('UserActionController', () => {
  let controller: UserActionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserActionController],
    }).compile();

    controller = module.get<UserActionController>(UserActionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
