import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  github_id?: number;

  @Prop({ required: true })
  username: string;

  @Prop()
  avatar_url: string;

  @Prop()
  access_token: string;

  @Prop()
  gitlab_id?: number;

  @Prop()
  bitbuck_id?: number;

  @Prop()
  platform: string;

  @Prop({ type: Object, default: {}})
  user_detail: Record<string,any>;
}

export const UserSchema = SchemaFactory.createForClass(User);
