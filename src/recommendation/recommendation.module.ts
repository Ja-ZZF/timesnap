import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';

@Module({
  imports: [HttpModule],      // ✅ 引入 HttpModule
  providers: [RecommendationService],
  controllers: [RecommendationController],
  exports: [RecommendationService],  // 如需在其他模块复用
})
export class RecommendationModule {}
