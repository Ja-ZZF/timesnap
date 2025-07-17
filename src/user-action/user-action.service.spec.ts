import { Test, TestingModule } from '@nestjs/testing';
import { UserActionService } from './user-action.service';

describe('UserActionService', () => {
  let service: UserActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserActionService],
    }).compile();

    service = module.get<UserActionService>(UserActionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
