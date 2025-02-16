import { Controller, Get,Post, Req,Body, Query ,BadRequestException, HttpException, HttpStatus} from '@nestjs/common';
import { GithubService } from './github.service';
import { UserRepoService } from './user-repo.service';

@Controller('github')
export class GithubController {

    constructor(private readonly githubService: GithubService, private readonly userRepoService: UserRepoService){}

    @Get('repos')
    async getRepos(@Query('token') token){
        // const accessToken = req.token;
        return this.githubService.getUserRepos(token);
    }

    @Post('repo-details')
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
                    userId      : "123",
                    owner       : body.owner,
                    repo        : body.repo,
                    isPrivate   : repoDetails.private,
                    accessToken : body.token,
                    branch      : repoDetails.default_branch,
                    language    : repoDetails.language,
                    envVariables: {}, // To be added later
                    commands    : {}, // To be added later
                    isDeployed  : false,
                    framework   : "",
                    html_url    : repoDetails.clone_url,
                    ssh_url     : repoDetails.ssh_url,
                    privateRepoUrl: privateRepoUrl // Add dynamically generated URL
                }

                const savedRepo = await this.userRepoService.saveUserRepo(repoData);
                return {message: 'Repo saved successfully!', repo: savedRepo}
            }
        }catch(error){
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
