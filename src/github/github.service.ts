import { Injectable } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class GithubService {
    async getUserRepos(accessToken: string){
        const response = await axios.get('https://api.github.com/user/repos',{
            headers: {Authorization: `Bearer ${accessToken}`},
            
        });

        return response.data;
    }

    async getRepoDetails(accessToken,owner,repo){
        try{
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`,{
                headers: {Authorization: `Bearer ${accessToken}`}
            });
            return response.data
        }catch(error){
            if(error.response){
                throw new Error(`GitHub API Error: ${error.response.status} - ${error.response.data.message}`)
            }else{
                throw new Error(`Failed to fetch repository: ${error.message}`);
            }
        }
    }

}
