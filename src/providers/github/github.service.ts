import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { AllUserRepo, AllUserRepoDocument } from '../../schemas/all-user-repos.schema';

dotenv.config();

@Injectable()
export class GithubService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(AllUserRepo.name) private readonly allUserRepoModel: Model<AllUserRepoDocument>
    ) {}


    async getGithubAccessToken(code: string) {
        const url = 'https://github.com/login/oauth/access_token';
        const params = {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        };

        const headers = { Accept: 'application/json' };
        const response = await axios.post(url, params, { headers });
        return response.data;
    }

    async getGitHubUser(access_token: string) {
        const url = 'https://api.github.com/user';
        const headers = { Authorization: `Bearer ${access_token}` };
        const response = await axios.get(url, { headers });
        return response.data;
    }

    generateJwt(user: any) {
        return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    }

    async saveUser(userData: { github_id: number; username: string; avatar_url: string; access_token: string,platform,user_detail  }) {
        const existingUser = await this.userModel.findOne({ github_id: userData.github_id });
        if (existingUser) {
            existingUser.access_token = userData.access_token;
            return existingUser.save();
        }
        const newUser = new this.userModel(userData);
        return newUser.save();
    }

    async getUserRepos(accessToken: string) {
        try {
            const response = await axios.get('https://api.github.com/user/repos', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const repos = response.data;

            if (!repos || repos.length === 0) {
                return [];
            }

            const repoData = {
                accessToken, // Later, store user ID instead of accessToken
                provider: 'github',
                repos, // Save all repositories as an array
            };

            await this.allUserRepoModel.findOneAndUpdate(
                { user_id: accessToken, platform: 'github' },
                { $set: repoData },
                { upsert: true, new: true }
            );

            return repos;
        } catch (error) {
            if (error.response) {
                throw new Error(`GitHub API Error: ${error.response.status} - ${error.response.data.message}`);
            } else {
                throw new Error(`Failed to fetch repositories: ${error.message}`);
            }
        }
    }

    async getRepoDetails(accessToken: string, owner: string, repo: string) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`GitHub API Error: ${error.response.status} - ${error.response.data.message}`);
            } else {
                throw new Error(`Failed to fetch repository: ${error.message}`);
            }
        }
    }
}
