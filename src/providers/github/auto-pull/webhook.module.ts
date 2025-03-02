import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebooksController } from './webhook.controller';
import { AllUserRepo, AllUserRepoSchema } from "../../../schemas/all-user-repos.schema";
import { UserRepo, UserRepoSchema } from "../../../schemas/user-repo.schema";
import { Webhook, WebhookSchema } from "../../../schemas/webhook.schema";
import { MongooseModule } from "@nestjs/mongoose";
@Module({
    imports: [
        MongooseModule.forFeature([ 
          { name: AllUserRepo.name, schema: AllUserRepoSchema },
          { name: UserRepo.name, schema: UserRepoSchema },
          { name: Webhook.name, schema: WebhookSchema },
          ]),
        ],
    providers: [WebhookService],
    controllers: [WebooksController],
    exports: [WebhookService]
})

export class WebhooksModule{}