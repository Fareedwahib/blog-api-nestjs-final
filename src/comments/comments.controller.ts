import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  ForbiddenException,
  Query
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schema/users.schema';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    // Set user ID from authenticated user
    createCommentDto.userId = req.user.userId;
    
    // Only admins can directly approve comments
    if (createCommentDto.isApproved && req.user.role !== UserRole.ADMIN) {
      createCommentDto.isApproved = false;
    }
    
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  findAll(@Query('postId') postId: string) {
    if (postId) {
      return this.commentsService.findByPostId(postId);
    }
    return this.commentsService.findAll();
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPendingComments(@Request() req) {
    // Only admins can see pending comments
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view pending comments');
    }
    return this.commentsService.getPendingComments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ) {
    return this.commentsService.update(
      id, 
      updateCommentDto, 
      req.user.userId, 
      req.user.role
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approveComment(@Param('id') id: string, @Request() req) {
    // Only admins can approve comments
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can approve comments');
    }
    return this.commentsService.approveComment(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.remove(id, req.user.userId, req.user.role);
  }
}