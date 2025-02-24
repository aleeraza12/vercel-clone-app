import { Controller, Get,Post, Req, Res, Body, Query ,BadRequestException, HttpException, HttpStatus} from '@nestjs/common';
import { GithubService } from './github.service';
import { UserRepoService } from '../../services/user-repo.service';

@Controller('auth/github')
export class GithubController {
    
    constructor(private readonly githubService: GithubService, private readonly userRepoService: UserRepoService){}
    
    //  redirect to github authorize page
    @Get('login')
    async redirectToGitHub(@Res() res) {
        const client_id = process.env.GITHUB_CLIENT_ID;
        const redirectUri = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo`;
        res.redirect(redirectUri);
    }
    
    // get oauth token using code that we get from login endpoint
    @Get('callback')
    async githubCallback(@Query('code') code, @Res() res) {
        console.log("inside.....");
        const access_token = await this.githubService.getGithubAccessToken(code);
        console.log("access token is....", access_token);
    
        const user = await this.githubService.getGitHubUser(access_token.access_token);
        console.log("user is.....", user.login);
    
        let savedUser = {};
        if (user) {
            savedUser = await this.githubService.saveUser({
                github_id: user.id,
                username: user.login,
                avatar_url: user.avatar_url,
                access_token: access_token.access_token,
                platform : 'github',
                user_detail : user
            });
        }
    
        res.json({ accessToken: access_token, user: user });
    }

    // return all user repos
    @Get('repos')
    async getRepos(@Query('token') token){
        // const accessToken = req.token;
        return this.githubService.getUserRepos(token);
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
            const repoDetails = await this.githubService.getRepoDetails(body.token,body.owner,body.repo)
            
            const isPrivate = repoDetails.private;
            console.log("isPrivate",isPrivate)
            // Function to construct private repo URL
            const getPrivateRepoUrl = (username: string, accessToken: string, repoUrl: string, isPrivate: boolean): string => {
                if (isPrivate) {
                    const urlParts = repoUrl.split('//'); // Splitting "https://github.com/..."
                    return `https://${username}:${accessToken}@${urlParts[1]}`;
                }
                return ''; // Public repos don't need authentication
            };

            const privateRepoUrl = getPrivateRepoUrl(body.owner, body.token, repoDetails.clone_url, isPrivate);
            
            if(repoDetails){
                const repoData = {
                    user_id             : "123",
                    owner               : body.owner,
                    repo                : body.repo,
                    is_private          : repoDetails.private,
                    access_token        : body.token,
                    branch              : repoDetails.default_branch,
                    language            : repoDetails.language,
                    env_variables       : {}, // To be added later
                    commands            : {}, // To be added later
                    is_deployed         : false,
                    framework           : "",
                    html_url            : repoDetails.clone_url,
                    ssh_url             : repoDetails.ssh_url,
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

