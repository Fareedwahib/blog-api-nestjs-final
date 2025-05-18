import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schema/users.schema';
import { Post } from '../../posts/schema/posts.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  postId: Post;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  commentText: string;

  @Prop({ default: false })
  isApproved: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);