import { Controller,Get,Query,Res,Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Get('github')
    async redirectToGitHub(@Res() res) {
        const client_id = process.env.GITHUB_CLIENT_ID
        const redirectUri = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo`;
        res.redirect(redirectUri)
    }

    @Get('github/callback')
    async githubCallback(@Query('code') code, @Res() res){
        console.log("inside.....")
        const access_token = await this.authService.getGithubAccessToken(code);
        console.log("access token is....",access_token)
        const user = await this.authService.getGitHubUser(access_token.access_token);
        console.log("user is.....",user.login)
        let savedUser = {};
        if(user){
            savedUser = await this.authService.saveUser({
                githubId: user.id,
                username: user.login,
                avatarUrl: user.avatar_url,
                accessToken: access_token.access_token,
            })
        }
        // const jwtToken = this.authService.generateJwt({username:user.login})
        res.json({accessToken:access_token,user:user})
    }
}
