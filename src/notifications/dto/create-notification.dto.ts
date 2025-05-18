import { IsNotEmpty, IsMongoId, IsOptional, IsBoolean, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateNotificationDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: mongoose.Schema.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}