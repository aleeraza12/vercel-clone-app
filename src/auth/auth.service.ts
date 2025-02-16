import { Injectable } from '@nestjs/common';
import axios from 'axios'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {User, UserDocument} from '../schemas/user.schema';

dotenv.config();

@Injectable()
export class AuthService {
    constructor (@InjectModel(User.name) private userModel: Model<UserDocument>){}
    async getGithubAccessToken(code){
        const url = 'https://github.com/login/oauth/access_token';
        const params = {
            client_id : process.env.GITHUB_CLIENT_ID,
            client_secret : process.env.GITHUB_CLIENT_SECRET,
            code
        }

        const headers = {Accept: 'application/json'}
        const response = await axios.post(url,params,{headers})
        return response.data
    }

    async getGitHubUser(access_token){
        const url = 'https://api.github.com/user';
        const headers = {Authorization: `Bearer ${access_token}`}
        const response = await axios.get(url,{headers})
        return response.data
    }

    generateJwt(user){
        return jwt.sign(user,process.env.JWT_SECRET,{ expiresIn: '1h' })
    }

    async saveUser(userData:{githubId:number, username: string, avatarUrl: string, accessToken: string}){
        const existingUser = await this.userModel.findOne({githubId:userData.githubId});
        if(existingUser){
            existingUser.accessToken = userData.accessToken;
            return existingUser.save();
        }
        const newUser = new this.userModel(userData);
        return newUser.save()
    }
}
