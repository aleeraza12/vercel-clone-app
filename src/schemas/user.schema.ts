import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  githubId: number;

  @Prop({ required: true })
  username: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  accessToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
