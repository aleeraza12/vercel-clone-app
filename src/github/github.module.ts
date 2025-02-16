import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GithubService } from './github.service';
import { UserRepoService } from './user-repo.service';
import { GithubController } from './github.controller';
import { UserRepo, UserRepoSchema } from "../schemas/user-repo.schema"; // ✅ Import the schema



@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserRepo.name, schema: UserRepoSchema }])
],
  providers: [GithubService,UserRepoService],
  exports: [UserRepoService],
  controllers: [GithubController]
})
export class GithubModule {}
