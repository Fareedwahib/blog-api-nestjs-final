import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { time } from 'console';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Schema({timestamps: true})
export class User extends Document {
    @Prop({required: true,})
    username: string;

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({default: false})
    isVerified: boolean;


    @Prop({type: String, enum: UserRole, default: UserRole.USER})
    role: UserRole;

    createdAt: Date;
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);