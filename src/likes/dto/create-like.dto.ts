import { IsNotEmpty, IsMongoId } from 'class-validator';
import mongoose from 'mongoose';

export class CreateLikeDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: mongoose.Schema.Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  postId: mongoose.Schema.Types.ObjectId;
}