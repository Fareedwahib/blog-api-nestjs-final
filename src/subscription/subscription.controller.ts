import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  Query,
  ForbiddenException
} from '@nestjs/common';
import { SubscriptionsService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schema/users.schema';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req) {
    // Set subscriberId from authenticated user if not provided
    if (!createSubscriptionDto.subscriberId) {
      createSubscriptionDto.subscriberId = req.user.userId;
    } else if (createSubscriptionDto.subscriberId.toString() !== req.user.userId 
              && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only create subscriptions for yourself');
    }
    
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('subscriberId') subscriberId: string, 
          @Query('authorId') authorId: string,
          @Query('categoryId') categoryId: string,
          @Request() req) {
    // Admin can view all subscriptions
    if (req.user.role === UserRole.ADMIN) {
      if (subscriberId) {
        return this.subscriptionsService.findBySubscriber(subscriberId);
      } else if (authorId) {
        return this.subscriptionsService.findByAuthor(authorId);
      } else if (categoryId) {
        return this.subscriptionsService.findByCategory(categoryId);
      }
      return this.subscriptionsService.findAll();
    }
    
    // Regular users can only view their own subscriptions
    return this.subscriptionsService.findBySubscriber(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const subscription = await this.subscriptionsService.findOne(id);
    
    // Check if user is the subscriber or an admin
    if (subscription.subscriberId.toString() !== req.user.userId 
        && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only view your own subscriptions');
    }
    
    return subscription;
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  checkSubscription(
    @Query('authorId') authorId: string,
    @Query('categoryId') categoryId: string,
    @Request() req
  ) {
    return this.subscriptionsService.checkSubscription(
      req.user.userId,
      authorId,
      categoryId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Request() req
  ) {
    const subscription = await this.subscriptionsService.findOne(id);
    
    // Check if user is the subscriber or an admin
    if (subscription.subscriberId.toString() !== req.user.userId 
        && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own subscriptions');
    }
    
    // Regular users cannot change the subscriberId
    if (updateSubscriptionDto.subscriberId && 
        updateSubscriptionDto.subscriberId.toString() !== req.user.userId && 
        req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot change the subscriber ID');
    }
    
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const subscription = await this.subscriptionsService.findOne(id);
    
    // Check if user is the subscriber or an admin
    if (subscription.subscriberId.toString() !== req.user.userId 
        && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own subscriptions');
    }
    
    return this.subscriptionsService.remove(id);
  }
}