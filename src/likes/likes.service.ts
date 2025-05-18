import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from './schema/likes.schema';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private readonly likeModel: Model<LikeDocument>,
  ) {}

  async create(createLikeDto: CreateLikeDto): Promise<Like> {
    try {
      const newLike = new this.likeModel(createLikeDto);
      return await newLike.save();
    } catch (error) {
      // Handle duplicate key error (user already liked the post)
      if (error.code === 11000) {
        throw new ConflictException('User has already liked this post');
      }
      throw error;
    }
  }

  async findAll(): Promise<Like[]> {
    return this.likeModel.find()
      .populate('userId', 'username email')
      .populate('postId', 'title slug')
      .exec();
  }

  async findByPostId(postId: string): Promise<Like[]> {
    return this.likeModel.find({ postId })
      .populate('userId', 'username email')
      .exec();
  }

  async findByUserId(userId: string): Promise<Like[]> {
    return this.likeModel.find({ userId })
      .populate('postId', 'title slug')
      .exec();
  }

  async findOne(id: string): Promise<Like> {
    const like = await this.likeModel.findById(id)
      .populate('userId', 'username email')
      .populate('postId', 'title slug')
      .exec();
    
    if (!like) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }
    
    return like;
  }

  async update(id: string, updateLikeDto: UpdateLikeDto): Promise<Like> {
    const updatedLike = await this.likeModel
      .findByIdAndUpdate(id, updateLikeDto, { new: true })
      .exec();
      
    if (!updatedLike) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }
    
    return updatedLike;
  }

  async remove(id: string): Promise<void> {
    const result = await this.likeModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }
  }

  async findUserLike(userId: string, postId: string): Promise<Like | null> {
    return this.likeModel.findOne({ userId, postId }).exec();
  }

  async removeLike(userId: string, postId: string): Promise<void> {
    const result = await this.likeModel.findOneAndDelete({ userId, postId }).exec();
    
    if (!result) {
      throw new NotFoundException(`Like not found for user on this post`);
    }
  }

  async countLikes(postId: string): Promise<number> {
    return this.likeModel.countDocuments({ postId }).exec();
  }
}