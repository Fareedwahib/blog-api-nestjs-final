import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comments.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserRole } from '../users/schema/users.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const newComment = new this.commentModel(createCommentDto);
    return newComment.save();
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel.find()
      .populate('userId', 'username email')
      .populate('postId', 'title slug')
      .exec();
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.commentModel.find({ postId, isApproved: true })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id)
      .populate('userId', 'username email')
      .populate('postId', 'title slug')
      .exec();
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string, userRole: string): Promise<Comment> {
    const comment = await this.findOne(id);
    
    // Check if user is the author of the comment or an admin
    if (comment.userId.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to update this comment');
    }
    
    // Regular users can only update the commentText field
    if (userRole !== UserRole.ADMIN) {
      const { commentText } = updateCommentDto;
      const updatedComment = await this.commentModel
        .findByIdAndUpdate(id, { commentText }, { new: true })
        .exec();
      if (!updatedComment) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }
      return updatedComment;
    }
    
    // Admins can update any field
    const updatedComment = await this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, { new: true })
      .exec();
    if (!updatedComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return updatedComment;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.findOne(id);
    
    // Check if user is the author of the comment or an admin
    if (comment.userId.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to delete this comment');
    }
    
    const result = await this.commentModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }

  async approveComment(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findByIdAndUpdate(id, { isApproved: true }, { new: true })
      .exec();
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    return comment;
  }

  async getPendingComments(): Promise<Comment[]> {
    return this.commentModel.find({ isApproved: false })
      .populate('userId', 'username email')
      .populate('postId', 'title slug')
      .sort({ createdAt: -1 })
      .exec();
  }
}