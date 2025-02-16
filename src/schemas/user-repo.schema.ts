import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRepoDocument = UserRepo & Document;

@Schema({ timestamps: true })
export class UserRepo {
  @Prop({ required: true })
  userId: string; // Store the authenticated user’s ID

  @Prop({ required: true })
  owner: string; // Repository owner (GitHub username)

  @Prop({ required: true })
  repo: string; // Repository name

  @Prop({ required: true })
  accessToken: string; // Token for GitHub API requests

  @Prop({ default: 'main' })
  branch: string; // Default branch (can be changed later)

  @Prop()
  language: string; // Detected programming language

  @Prop({ default: false })
  isPrivate: boolean; // Detected programming language

  @Prop()
  framework: string;

  @Prop()
  html_url: string;

  @Prop()
  ssh_url: string;

  @Prop()
  privateRepoUrl: string;

  @Prop({ type: Object, default: {} })
  envVariables: Record<string, string | boolean | number>; // Store environment variables

  @Prop({type: Object, default: {}})
  commands: Record<string, string | boolean | number>

  @Prop({ default: false })
  isDeployed: boolean; // Track whether the repo is deployed
}

export const UserRepoSchema = SchemaFactory.createForClass(UserRepo);
