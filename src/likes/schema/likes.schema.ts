import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schema/users.schema';
import { Post } from '../../posts/schema/posts.schema';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  postId: Post;

  createdAt: Date;
  updatedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Create a compound index to prevent duplicate likes
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });