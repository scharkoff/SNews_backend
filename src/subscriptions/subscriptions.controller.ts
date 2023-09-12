import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('/follow/:followingId')
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Param('followingId') followingId: number) {
    return await this.subscriptionsService.create(req.user.id, +followingId);
  }

  @Get()
  async findAll() {
    return await this.subscriptionsService.findAll();
  }

  @Get('/popular')
  async findPopularUsers(
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    return await this.subscriptionsService.findPopularUsers(skip, take);
  }

  @Get('/:id')
  async findAllByFollowerId(@Param('id') followerId: number) {
    return await this.subscriptionsService.findAllByFollowerId(followerId);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.subscriptionsService.remove(id);
  }
}
