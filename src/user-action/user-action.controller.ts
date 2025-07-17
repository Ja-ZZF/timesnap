import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserActionService } from './user-action.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/user.decorator';
import { ActionEnum } from './entities/user-action.entity';

@Controller('user-action')
export class UserActionController {
    constructor(private userActionService : UserActionService){}
    

    @UseGuards(AuthGuard('jwt'))
    @Post('add')
    async addUserAction(
        @CurrentUser('user_id') self_id : number,
        @Body('post_id') post_id : number,
        @Body('action_type') action_type : ActionEnum
    ){
        await this.userActionService.addAction(self_id,post_id,action_type)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getUserInterestTags(@CurrentUser('user_id') self_id : number){
        return await this.userActionService.getUserInterestTags(self_id,5);
    }
}
