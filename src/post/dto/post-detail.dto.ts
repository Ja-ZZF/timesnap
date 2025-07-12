import { MediaSimple } from "src/media/dto/media-simple.dto";
import { PostSimple } from "./post-simple.dto";
import { Permission } from "src/dto/permission.dto";
import { CollectStats } from "src/collect/dto/collect-stats.dto";
import { TagSimple } from "src/tag/dto/tag-simple.dto";
import { CommentSimple } from "src/comment/dto/comment-simple.dto";

export class PostDetail{
    post_simple : PostSimple;
    content : string;
    medias : MediaSimple[];
    permission : Permission;
    publish_time : Date;
    collect_stats :CollectStats;
    browse_count : number;
    comment_count : number;
    tags : TagSimple[];
    comments : CommentSimple[];
}