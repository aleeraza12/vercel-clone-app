import { Get, Controller, Query, Redirect, Res,Body, Post,BadRequestException, HttpException, HttpStatus, NotFoundException, InternalServerErrorException} from '@nestjs/common';
import { Response } from 'express';
import { GitlabAuthService } from './gitlab-auth.service';
import { UserRepoService } from '../../services/user-repo.service';

@Controller('auth/gitlab')
export class GitlabAuthController{

    constructor(private readonly gitlabAuthService: GitlabAuthService, private readonly userRepoService: UserRepoService){}

    // Step 1: Redirect User to GitLab for Authentication
    @Get('login')
    @Redirect()
    login(){
        return {
            url: this.gitlabAuthService.getGitlabAuthUrl()
        };
    }

    // Step 2: Handle GitLab OAuth Callback and Get Access Token
    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response){
        try{
            console.log("code is.....",code)
            const tokenData = await this.gitlabAuthService.exchangeCodeForToken(code)
            return res.json({tokenData})
        }
        catch(err){
            return res.status(500).json({error:'Authentication failed'})
        }
    }

    // Get all user repos to show on frontend so that user can select one to host
    @Get('repos')
    async getRepos(@Query('accessToken') accessToken: string) {
        try {
            if (!accessToken) {
                throw new BadRequestException('Access token is required.');
            }
    
            // Fetch GitLab user details
            const gitlabUser = await this.gitlabAuthService.getGitlabUser(accessToken);
            if (!gitlabUser) {
                throw new NotFoundException('GitLab user not found. Invalid access token.');
            }
    
            console.log("GitLab User:", gitlabUser);
            let savedUser = {};
    
            // Save user details in the database
            try {
                savedUser = await this.gitlabAuthService.saveUser({
                    gitlab_id: gitlabUser.id,
                    username: gitlabUser.username,
                    avatar_url: gitlabUser.avatar_url,
                    access_token: accessToken,
                    platform: 'gitlab',
                    user_detail: gitlabUser
                });
            } catch (error) {
                throw new InternalServerErrorException('Failed to save user details.', error.message);
            }
    
            // Fetch GitLab repositories
            let repos = [];
            try {
                repos = await this.gitlabAuthService.getUserRepos(accessToken);
            } catch (error) {
                throw new InternalServerErrorException('Failed to fetch repositories.', error.message);
            }
    
            return { message: 'Repo fetched successfully!', repos, user: savedUser };
        } catch (error) {
            console.error("Error fetching GitLab repositories:", error.message);
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    
    // save one user repo to host
    @Post('save-repo-details')
    async getRepoDetails(@Body() body: any){
        console.log('Full body:', body);
        if (!body.token || !body.owner || !body.repo) {
            throw new BadRequestException('Token, owner, and repo name are required.');
        }
        console.log(body.token,body.owner,body.repo)
        try{
            const repoDetails = await this.gitlabAuthService.getGitLabRepoDetails(body.token,body.repo)

            // Function to construct private repo URL
            const getPrivateRepoUrl = (username: string, accessToken: string, repoUrl: string): string => {
            return `https://oauth2:${accessToken}@gitlab.com/${repoUrl}`; 
            };

            const privateRepoUrl = getPrivateRepoUrl(body.owner, body.token, body.repo);
            
            if(repoDetails){
                const repoData = {
                    user_id             : "123",
                    owner               : body.owner,
                    repo                : body.repo,
                    is_private          : repoDetails.visibility,
                    access_token        : body.token,
                    branch              : repoDetails.default_branch,
                    env_variables       : {}, // To be added later
                    commands            : {}, // To be added later
                    is_deployed         : false,
                    framework           : "",
                    html_url            : repoDetails.http_url_to_repo,
                    ssh_url             : repoDetails.ssh_url_to_repo,
                    private_repo_url    : privateRepoUrl, // Add dynamically generated URL
                    user_repo           : repoDetails // Add dynamically generated URL
                }

                const savedRepo = await this.userRepoService.saveUserRepo(repoData);
                return {message: 'Repo saved successfully!', repo: savedRepo}
            }
        }catch(error){
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}

