import { UserSimple } from "src/user/dto/user-simple.dto";

export class ChatSimple{
    chat_id : number;
    contact_id : number;
    sender : UserSimple;
    send_time : Date;
    content : string;
    isImage : boolean;
}