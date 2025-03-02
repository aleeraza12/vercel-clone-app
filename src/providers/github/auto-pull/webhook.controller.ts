import { Controller, Post, Query, Body} from '@nestjs/common'
import { WebhookService } from './webhook.service'


@Controller('webhooks')
export class WebooksController{
    constructor (private readonly webhookservice: WebhookService){}

    @Post('register/github')
    async registerGitHubWebhook(
        @Query('accessToken') accessToken: string,
        @Query('owner') owner: string,
        @Query('repo') repo: string
    ){
        return this.webhookservice.registerGitHubWebhook(accessToken,owner,repo)
    }

    @Post('github')
    async handleGitHubWebhook(@Body() res: any) {
        console.log('GitLab Webhook Event:', res.payload);

        try {
            const savedWebhook = await this.webhookservice.saveWebhookPayload(res.payload);
            return { message: 'Webhook payload saved successfully!', data: savedWebhook };
        } catch (error) {
            console.error('Error saving webhook payload:', error);
            throw error;
        }

    }
}