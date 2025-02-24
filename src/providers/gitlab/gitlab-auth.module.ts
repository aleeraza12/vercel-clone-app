import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GitlabAuthService } from './gitlab-auth.service';
import { GitlabAuthController } from './gitlab-auth.controller';
import { UserRepoService } from '../../services/user-repo.service';
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
  controllers: [GitlabAuthController],
  providers: [GitlabAuthService, UserRepoService], // 👈 Ensure this is provided
  exports: [GitlabAuthService],
})
export class GitlabAuthSModule {}
