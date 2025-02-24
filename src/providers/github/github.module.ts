import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GithubService } from './github.service';
import { UserRepoService } from '../../services/user-repo.service';
import { GithubController } from './github.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { UserRepo, UserRepoSchema } from "../../schemas/user-repo.schema"; 
import { AllUserRepo, AllUserRepoSchema } from "../../schemas/all-user-repos.schema";

@Module({
  imports: [
    MongooseModule.forFeature([ 
      { name: User.name, schema: UserSchema },
      { name: UserRepo.name, schema: UserRepoSchema },
      { name: AllUserRepo.name, schema: AllUserRepoSchema },
      ]),
    ],
  providers: [GithubService,UserRepoService],
  exports: [UserRepoService],
  controllers: [GithubController]
})
export class GithubModule {}
