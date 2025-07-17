import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RecommendationService {
  constructor(private readonly httpService: HttpService) {}

  async getRecommendedPosts(userId: number, numPosts: number = 10, is_video : boolean = false): Promise<number[]> {
  const apiUrl = 'http://127.0.0.1:8000/recommend_posts';
  try {
    console.log('Calling FastAPI with:', { userId, numPosts });

    const response = await lastValueFrom(
      this.httpService.post(apiUrl, {
        user_id: Number(userId),
        num_posts: Number(numPosts),
        is_video : is_video,
      }),
    );

    return response.data.recommended_post_ids;
  } catch (error) {
    console.error('Failed to fetch recommended posts:', error.message);
    console.error(error.response?.data);
    return [];
  }
}

}
