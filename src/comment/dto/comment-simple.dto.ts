import { LikeStats } from "src/like/dto/like-stats.dto";
import { MediaSimple } from "src/media/dto/media-simple.dto";
import { UserSimple } from "src/user/dto/user-simple.dto";

export class CommentSimple{
    comment_id : number;
    post_id : number;
    commenter : UserSimple;
    content : string;
    medias : MediaSimple[];
    comment_time : Date;
    like_stats : LikeStats;
    children : CommentSimple[];
}