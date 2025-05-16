import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';  
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [   ConfigModule.forRoot({
      isGlobal: true,}),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (ConfigService: ConfigService) => ({
          uri: ConfigService.get<string>('mongodb_url'),
      }),
      inject: [ConfigService],
    }),UsersModule, RolesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
