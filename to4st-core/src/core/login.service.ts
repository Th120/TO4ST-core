import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';


import { Role } from '../shared/auth.utils';
import { AppConfigService } from './app-config.service';


/**
 * Service for login
 */
@Injectable()
export class LoginService {
    constructor(private readonly appConfigService: AppConfigService)
    {
    }

    /**
     * Login administrator
     * @param password 
     * @returns JSON Webtoken
     * @throws if password is invalid
     */
    async login(password: string): Promise<string>
    {
        const appcfg = await this.appConfigService.getAppConfig(false);

        const pwMatches = await bcrypt.compare(password, appcfg.password);

        if(!pwMatches)
        {
            throw new HttpException("Password does not match.", HttpStatus.FORBIDDEN);
        }

        const token = jwt.sign(
            {
                role: Role.admin
            },
            appcfg.secret,
            {
                expiresIn: "12d"
            });
        
        return token;
    }

}
