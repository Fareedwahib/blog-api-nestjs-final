import { IsNotEmpty, IsString, IsMongoId, IsOptional, IsBoolean } from 'class-validator';
import mongoose from 'mongoose';

export class CreateCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  postId: mongoose.Schema.Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  userId?: mongoose.Schema.Types.ObjectId; // Optional as it can be set from the JWT token

  @IsString()
  @IsNotEmpty()
  commentText: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean; // Optional as it may be set by admins only
}