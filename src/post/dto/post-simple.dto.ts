import { LikeStats } from "src/like/dto/like-stats.dto";
import { UserSimple } from "src/user/dto/user-simple.dto";

export class PostSimple{
    post_id : number;
    title : string;
    publisher : UserSimple;
    like_stats : LikeStats;
    cover_url : string;
}