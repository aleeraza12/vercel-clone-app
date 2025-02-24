import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRepoDocument = UserRepo & Document;

@Schema({ timestamps: true })
export class UserRepo {
  @Prop({ required: true })
  user_id: string; // Store the authenticated user’s ID

  @Prop({ required: true })
  owner: string; // Repository owner (GitHub username)

  @Prop({ required: true })
  repo: string; // Repository name

  @Prop({ required: true })
  access_token: string; // Token for GitHub API requests

  @Prop({ default: 'main' })
  branch: string; // Default branch (can be changed later)

  @Prop()
  language: string; // Detected programming language

  @Prop({ default: false })
  is_private: string; // Detected programming language

  @Prop()
  framework: string;

  @Prop()
  html_url: string;

  @Prop()
  ssh_url: string;

  @Prop()
  private_repo_url: string;

  @Prop()
  directory: string;

  @Prop({ type: Object, default: {} })
  env_variables: Record<string, string | boolean | number>; // Store environment variables

  @Prop({type: Object, default: {}})
  commands: Record<string, string | boolean | number>

  @Prop({type: Object, default: {}})
  user_repo: Record<string, string | boolean | number>

  @Prop({ default: false })
  is_deployed: boolean; // Track whether the repo is deployed
}

export const UserRepoSchema = SchemaFactory.createForClass(UserRepo);
