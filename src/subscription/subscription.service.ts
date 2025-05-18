import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schema/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import mongoose from 'mongoose';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Validate that at least one of authorId or categoryId is provided
    if (!createSubscriptionDto.authorId && !createSubscriptionDto.categoryId) {
      throw new ConflictException('Either authorId or categoryId must be provided');
    }

    // Check if subscription already exists
    const existingSubscription = await this.subscriptionModel.findOne({
      subscriberId: createSubscriptionDto.subscriberId,
      ...(createSubscriptionDto.authorId && { authorId: createSubscriptionDto.authorId }),
      ...(createSubscriptionDto.categoryId && { categoryId: createSubscriptionDto.categoryId }),
    });

    if (existingSubscription) {
      throw new ConflictException('Subscription already exists');
    }

    const newSubscription = new this.subscriptionModel(createSubscriptionDto);
    return newSubscription.save();
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionModel.find()
      .populate('subscriberId', 'username email')
      .populate('authorId', 'username email')
      .populate('categoryId', 'name slug')
      .exec();
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findById(id)
      .populate('subscriberId', 'username email')
      .populate('authorId', 'username email')
      .populate('categoryId', 'name slug')
      .exec();
    
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    
    return subscription;
  }

  async findBySubscriber(subscriberId: string): Promise<Subscription[]> {
    return this.subscriptionModel.find({ subscriberId })
      .populate('subscriberId', 'username email')
      .populate('authorId', 'username email')
      .populate('categoryId', 'name slug')
      .exec();
  }

  async findByAuthor(authorId: string): Promise<Subscription[]> {
    return this.subscriptionModel.find({ authorId })
      .populate('subscriberId', 'username email')
      .populate('authorId', 'username email')
      .populate('categoryId', 'name slug')
      .exec();
  }

  async findByCategory(categoryId: string): Promise<Subscription[]> {
    return this.subscriptionModel.find({ categoryId })
      .populate('subscriberId', 'username email')
      .populate('authorId', 'username email')
      .populate('categoryId', 'name slug')
      .exec();
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const updatedSubscription = await this.subscriptionModel
      .findByIdAndUpdate(id, updateSubscriptionDto, { new: true })
      .exec();
      
    if (!updatedSubscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    
    return updatedSubscription;
  }

  async remove(id: string): Promise<void> {
    const result = await this.subscriptionModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  async checkSubscription(subscriberId: string, authorId?: string, categoryId?: string): Promise<boolean> {
    const query: any = { subscriberId: new mongoose.Types.ObjectId(subscriberId) };
    
    if (authorId) {
      query.authorId = new mongoose.Types.ObjectId(authorId);
    }
    
    if (categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    
    const subscription = await this.subscriptionModel.findOne(query).exec();
    return !!subscription;
  }
}