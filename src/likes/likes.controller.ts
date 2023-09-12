import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  likePost(@Param('id') postId: number, @Req() req) {
    return this.likesService.likePost(req.user.id, postId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  unlikePost(@Param('id') postId: number, @Req() req) {
    return this.likesService.unlikePost(req.user.id, postId);
  }

  @Get(':id')
  findLikesByPostId(@Param('id') postId: number) {
    return this.likesService.findLikesByPostId(postId);
  }
}
