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
  ForbiddenException
} from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schema/users.schema';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    // Only admins can create notifications for other users
    if (createNotificationDto.userId.toString() !== req.user.userId && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to create notifications for other users');
    }
    return this.notificationService.create(createNotificationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // Only admins can see all notifications
    if (req.user.role !== UserRole.ADMIN) {
      return this.notificationService.findByUserId(req.user.userId);
    }
    return this.notificationService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread')
  findUnread(@Request() req) {
    return this.notificationService.findUnreadByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.notificationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Request() req
  ) {
    return this.notificationService.update(
      id, 
      updateNotificationDto, 
      req.user.userId, 
      req.user.role
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationService.markAsRead(id, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mark-all-read')
  markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.notificationService.remove(id, req.user.userId, req.user.role);
  }
}