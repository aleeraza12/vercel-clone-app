import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GithubService } from './github.service';
import { UserRepoService } from '../../services/user-repo.service';
import { WebhookService } from '../github/auto-pull/webhook.service';
import { GithubController } from './github.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { UserRepo, UserRepoSchema } from "../../schemas/user-repo.schema"; 
import { AllUserRepo, AllUserRepoSchema } from "../../schemas/all-user-repos.schema";
import { Webhook, WebhookSchema } from "src/schemas/webhook.schema";
@Module({
  imports: [
    MongooseModule.forFeature([ 
      { name: User.name, schema: UserSchema },
      { name: UserRepo.name, schema: UserRepoSchema },
      { name: AllUserRepo.name, schema: AllUserRepoSchema },
      { name: Webhook.name, schema: WebhookSchema },
      ]),
    ],
  providers: [GithubService,UserRepoService,WebhookService],
  exports: [UserRepoService,WebhookService],
  controllers: [GithubController]
})
export class GithubModule {}
