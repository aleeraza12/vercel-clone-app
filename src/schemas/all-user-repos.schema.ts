import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

export type AllUserRepoDocument = AllUserRepo & Document;

@Schema()
export class AllUserRepo{
    @Prop({ required: true, index: true})
    userId: string

    @Prop({ required: true})
    platform:  'github' | 'gitlab' | 'bitbucket'; // Service type
    
    @Prop({ required: true, type: Array})
    repos: Record<string,any>[];

    @Prop({ type: Date, default: Date.now})
    created_at: Date

}

export const AllUserRepoSchema = SchemaFactory.createForClass(AllUserRepo)