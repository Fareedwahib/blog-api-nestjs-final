import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';  
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './category/category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { SubscriptionsModule } from './subscription/subscription.module';
import { NotificationModule } from './notifications/notifications.module';

@Module({
  imports: [   
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb_url'),
      }),
      inject: [ConfigService],
    }),
    UsersModule, 
    AuthModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
    LikesModule,
    SubscriptionsModule,
    NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}