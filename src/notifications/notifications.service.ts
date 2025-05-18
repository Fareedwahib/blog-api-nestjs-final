import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schema/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UserRole } from '../users/schema/users.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const newNotification = new this.notificationModel(createNotificationDto);
    return newNotification.save();
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id)
      .populate('userId', 'username email')
      .exec();
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, userId: string, userRole: string): Promise<Notification> {
    const notification = await this.findOne(id);
    
    // Check if user owns the notification or is an admin
    if (notification.userId.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to update this notification');
    }
    
    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .exec();
      
    if (!updatedNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return updatedNotification;
  }

  async markAsRead(id: string, userId: string, userRole: string): Promise<Notification> {
    const notification = await this.findOne(id);
    
    // Check if user owns the notification or is an admin
    if (notification.userId.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to update this notification');
    }
    
    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .exec();
      
    if (!updatedNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return updatedNotification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ userId, isRead: false }, { isRead: true })
      .exec();
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const notification = await this.findOne(id);
    
    // Check if user owns the notification or is an admin
    if (notification.userId.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to delete this notification');
    }
    
    const result = await this.notificationModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
}