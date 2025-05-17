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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    // Set author ID from authenticated user if not provided
    if (!createPostDto.authorId) {
      createPostDto.authorId = req.user.userId;
    }
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll(@Query('published') published: boolean) {
    return published ? this.postsService.findPublished() : this.postsService.findAll();
  }

@Get('slug/:slug')
async findBySlug(@Param('slug') slug: string) {
  const post = await this.postsService.findBySlug(slug);
  
  // Check if post exists and has an id before incrementing views
  if (post && post.authorId) {
    await this.postsService.incrementViews(post.authorId.toString());
  }
  
  return post;
}


  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    await this.postsService.incrementViews(id);
    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updatePostDto: UpdatePostDto,
    @Request() req
  ) {
    // Check if user is the author of the post or an admin
    const post = await this.postsService.findOne(id);
    if (post.authorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You are not authorized to update this post');
    }
    
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // Check if user is the author of the post or an admin
    const post = await this.postsService.findOne(id);
    if (post.authorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You are not authorized to delete this post');
    }
    
    return this.postsService.remove(id);
  }
}