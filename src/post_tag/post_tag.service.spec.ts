import { Test, TestingModule } from '@nestjs/testing';
import { PostTagService } from './post_tag.service';

describe('PostTagService', () => {
  let service: PostTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostTagService],
    }).compile();

    service = module.get<PostTagService>(PostTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
