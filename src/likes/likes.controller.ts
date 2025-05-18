import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  UseGuards,
  Request,
  ForbiddenException,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLikeDto } from './dto/create-like.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  async like(@Param('postId') postId: string, @Request() req) {
    const userId = req.user.userId;
    
    // Create a like object
    const createLikeDto: CreateLikeDto = {
      userId,
      postId: new (require('mongoose').Types.ObjectId)(postId),
    };
    
    return this.likesService.create(createLikeDto);
  }

  @Get()
  findAll(@Query('postId') postId: string, @Query('userId') userId: string) {
    if (postId) {
      return this.likesService.findByPostId(postId);
    }
    if (userId) {
      return this.likesService.findByUserId(userId);
    }
    return this.likesService.findAll();
  }

  @Get('count/:postId')
  async countLikes(@Param('postId') postId: string) {
    const count = await this.likesService.countLikes(postId);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:postId')
  async checkUserLike(@Param('postId') postId: string, @Request() req) {
    const userId = req.user.userId;
    const like = await this.likesService.findUserLike(userId, postId);
    return { hasLiked: !!like };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlike(@Param('postId') postId: string, @Request() req) {
    const userId = req.user.userId;
    await this.likesService.removeLike(userId, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const like = await this.likesService.findOne(id);
    
    // Check if user is the one who liked the post
    if (like.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You are not authorized to remove this like');
    }
    
    await this.likesService.remove(id);
  }
}