import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookDocument = Webhook & Document;

@Schema()
export class Webhook {
  @Prop()
  github_id?: number;

  @Prop()
  username: string;

  @Prop()
  sender: string;

  @Prop()
  repository: string;

  @Prop()
  gitlab_id?: number;

  @Prop()
  bitbuck_id?: number;

  @Prop()
  platform: string;

  @Prop({ type: Object, default: {}})
  webhook_detail: Record<string,any>;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
