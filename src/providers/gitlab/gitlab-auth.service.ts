import { Injectable } from "@nestjs/common";
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { AllUserRepo, AllUserRepoDocument } from '../../schemas/all-user-repos.schema';

@Injectable()
export class GitlabAuthService{
constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(AllUserRepo.name) private readonly allUserRepoModel: Model<AllUserRepoDocument>
    ) {}

    private readonly clientId = process.env.GITLAB_CLIENT_ID
    private readonly clientSecret = process.env.GITLAB_CLIENT_SECRET
    private readonly redirectUri = process.env.GITLAB_CALLBACK_URL

    getGitlabAuthUrl(){
        return `https://gitlab.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=read_user read_api`
    }

    async exchangeCodeForToken(code){
        console.log("inside.......",code)
        const tokenUrl = 'https://gitlab.com/oauth/token';
        try{
            const response = await axios.post(tokenUrl,{
                client_id:this.clientId,
                client_secret: this.clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri
            });
            console.log("response....",response)
        }catch(Err){
            console.log("err",Err)
        }
        // return response.data
    }

    async getGitlabUser(accessToken){
        const url = 'https://gitlab.com/api/v4/user';
        const headers = { Authorization: `Bearer ${accessToken}` };
        try{
            const response = await axios.get(url, {headers});
            return response.data;
        }catch(error){
            throw new Error(`GitLab API Error: ${error.response?.status} - ${error.response?.data?.message}`);
        }
    }

    async getUserRepos(accessToken: string) {
        const url = 'https://gitlab.com/api/v4/projects?membership=true';
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    }

    async getGitLabRepoDetails(accessToken: string, projectIdOrPath: string) {
        try {
            const encodedPath = encodeURIComponent(projectIdOrPath); // URL encode for GitLab API
            const response = await axios.get(`https://gitlab.com/api/v4/projects/${encodedPath}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`GitLab API Error: ${error.response.status} - ${error.response.data.message}`);
            } else {
                throw new Error(`Failed to fetch repository: ${error.message}`);
            }
        }
    }
    

    async saveUser(userData: { gitlab_id: number; username: string; avatar_url: string; access_token: string,platform,user_detail  }) {
        console.log("user data...",userData)
        const existingUser = await this.userModel.findOne({ gitlab_id: userData.gitlab_id });
        if (existingUser) {
            existingUser.access_token = userData.access_token;
            return existingUser.save();
        }
        console.log("before saving......")
        const newUser = new this.userModel(userData);
        return newUser.save();
    }

}