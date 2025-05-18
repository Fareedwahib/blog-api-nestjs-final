import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CreateSubscriptionDto {
  @IsMongoId()
  @IsNotEmpty()
  subscriberId: mongoose.Schema.Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  authorId?: mongoose.Schema.Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  categoryId?: mongoose.Schema.Types.ObjectId;
}