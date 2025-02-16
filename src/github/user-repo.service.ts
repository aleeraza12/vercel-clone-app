import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {UserRepo, UserRepoDocument} from '../schemas/user-repo.schema';

@Injectable()
export class UserRepoService{
    constructor(@InjectModel(UserRepo.name) private UserRepoModel:Model<UserRepoDocument>){}

    async saveUserRepo(repoData: Partial<UserRepo>){
        const repo = new this.UserRepoModel(repoData);
        return await repo.save();
    }

}
