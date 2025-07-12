import { FollowStats } from 'src/follow/dto/follow-stats.dto';
import { UserService } from '../user.service';
import { UserSimple } from './user-simple.dto';

export class UserDetail {
  user_simple: UserSimple;
  introduction: string;
  follow_stats: FollowStats;
  like_count: number;
  collect_count: number;
}
