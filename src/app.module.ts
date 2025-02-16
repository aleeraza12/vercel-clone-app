import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GithubModule } from './github/github.module';
import {MongooseModule} from '@nestjs/mongoose';

@Module({
  imports: [AuthModule, GithubModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/vercel?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.9'), // Change DB name

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
