import { Injectable } from "@nestjs/common";
import axios  from "axios";
import { Webhook, WebhookDocument } from '../../../schemas/webhook.schema';
import { UserRepo, UserRepoSchema } from '../../../schemas/user-repo.schema'; 
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WebhookService{
    constructor(
        @InjectModel(UserRepo.name) private readonly userRepoModel: Model<typeof UserRepoSchema>,
        @InjectModel(Webhook.name) private readonly webhookModel: Model<WebhookDocument>
    ){}
    async registerGitHubWebhook(accessToken:string, owner: string, repo: string){
        // const webhookUrl = "http://localhost:3000/webhooks/github"
        // this is the URL where github will send us the webhook if anything changes in user's repo like push
        const webhookUrl = process.env.GITHUB_INCOMING_WEBHOOK_URL;

        try{
            const response = await axios.post(
                `https://api.github.com/repos/${owner}/${repo}/hooks`,{
                    name: 'web',
                    active: true,
                    events:['push'],
                    config:{
                        url: webhookUrl,
                        content_type:'application/json',
                        secret: process.env.GITHUB_WEBHOOK_SECRET
                    }
                },
                {
                    headers: { 'Authorization': `Bearer ${accessToken}`}   
                }
            );
            console.log('GitHub Webhook Registered:', response.data);
            this.saveGitHubWebhook(accessToken,owner,repo,webhookUrl)
            return response.data
        }catch(error){
            console.error('Error registering GitHub webhook:', error.response?.data || error.message);
            throw error;
        }
    }

    async saveGitHubWebhook(accessToken,owner,repo,webhookUrl){
        await this.userRepoModel.findOneAndUpdate(
            { user_id: accessToken, owner: owner,repo: repo },
            { $set: {'is_webhook_enable':true,'webhook_url':webhookUrl}},
            { upsert: true, new: true }
        );
    }

    async saveWebhookPayload(payload){
        const parsedPayload = JSON.parse(payload)
        const newWebhook = new this.webhookModel({
            repository: parsedPayload.repository?.name || 'unknown',
            sender: parsedPayload.sender?.login || 'unknown',
            webhook_detail: parsedPayload, // Storing full parsedPayload
            platform: 'github',
            github_id: parsedPayload.repository?.id, 
            username: parsedPayload.repository?.owner?.login || 'unknown' // FIXED HERE
        });        
        return newWebhook.save();
    }
}