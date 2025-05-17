import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schema/posts.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Generate slug if not provided
    if (!createPostDto.slug) {
      createPostDto.slug = slugify(createPostDto.title, { lower: true });
    }

    // Check if slug already exists
    const existingPost = await this.postModel.findOne({ slug: createPostDto.slug });
    if (existingPost) {
      throw new ConflictException(`Post with slug '${createPostDto.slug}' already exists`);
    }

    const newPost = new this.postModel(createPostDto);
    return newPost.save();
  }

  async findAll(query: any = {}): Promise<Post[]> {
    return this.postModel.find(query)
      .populate('authorId', 'username email')
      .populate('categoryId')
      .exec();
  }

  async findPublished(): Promise<Post[]> {
    return this.findAll({ isPublished: true });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id)
      .populate('authorId', 'username email')
      .populate('categoryId')
      .exec();
      
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postModel.findOne({ slug })
      .populate('authorId', 'username email')
      .populate('categoryId')
      .exec();
      
    if (!post) {
      throw new NotFoundException(`Post with slug '${slug}' not found`);
    }
    
    return post;
  }

  async incrementViews(id: string): Promise<Post> {
    const post = await this.postModel.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).exec();
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    // If slug is being updated, check if new slug already exists
    if (updatePostDto.slug) {
      const existingPost = await this.postModel.findOne({ 
        slug: updatePostDto.slug,
        _id: { $ne: id } // exclude current post
      });
      
      if (existingPost) {
        throw new ConflictException(`Post with slug '${updatePostDto.slug}' already exists`);
      }
    }
    
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
      
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return updatedPost;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }
}