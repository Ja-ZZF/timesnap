import { UserSimple } from "src/user/dto/user-simple.dto";

export class ContactSimple{
    contact_id : number;
    friend : UserSimple;
    latest_message : string;
}