import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsMongoId, IsUrl } from 'class-validator';
import mongoose from 'mongoose';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @IsMongoId()
  authorId: mongoose.Schema.Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  categoryId?: mongoose.Schema.Types.ObjectId;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}