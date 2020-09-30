import { Injectable, HttpException, HttpStatus, } from '@nestjs/common';
import _ from "lodash"
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, } from 'typeorm';


import { RegisteredPlayer } from './registered-player.entity';
import {  MIN_SEARCH_LEN, MAX_PAGE_SIZE_WITH_STEAMID } from '../globals';
import { steamId64ToAccountId, isValidSteamId, } from '../shared/utils';
import { SteamUserService } from '../core/steam-user.service';


/**
 * Interface used to identify a registered player
 */
export interface IRegisteredPlayerIdentifier {
    id?: number, 
    steamId64?: string
}

/**
 * Interface used to query registered players
 */
export interface IRegisteredPlayerQuery {
    page?: number, 
    pageSize?: number, 
    search?: string
}

/**
 * Server used to manage registered players
 */
@Injectable()
export class RegisteredPlayerService {
    constructor(
        @InjectRepository(RegisteredPlayer) private readonly registeredPlayerRepository: Repository<RegisteredPlayer>, 
        @InjectConnection() private readonly connection: Connection,
        private readonly steamUserService: SteamUserService,
        )
    {
    }

    /**
     * Create or update registered player
     * @param player 
     * @throws if steamId64 not valid
     */
    async createUpdateRegisteredPlayer(player: RegisteredPlayer): Promise<RegisteredPlayer>
    {
        const toInsert = new RegisteredPlayer({...player});

        if(toInsert.steamId64)
        {
            if(!isValidSteamId(toInsert.steamId64))    
            {
                throw new HttpException(`Invalid SteamId64: ${toInsert.steamId64}`, HttpStatus.BAD_REQUEST);
            }        
        }

        if(!toInsert.id) // check whether player was already in db to prevent unique exception
        {
            const foundInDb = await this.getRegisteredPlayer({steamId64: toInsert.steamId64});
            toInsert.id = foundInDb?.id;
        }

        const inserted = await this.registeredPlayerRepository.save(toInsert);

        await this.steamUserService.updateSteamUsers([toInsert.steamId64]);

        return await this.getRegisteredPlayer({id: inserted.id});
    }


    /**
     * Get registered player
     * @param options 
     */
    async getRegisteredPlayer(options: IRegisteredPlayerIdentifier): Promise<RegisteredPlayer | undefined>
    {
        const res = await this.registeredPlayerRepository.findOne({where: !!options.id ? {id: options.id} : {steamId64: options.steamId64}});
        return res;
    }

    /**
     * Get registered players
     * @param options 
     */
    async getRegisteredPlayers(options: IRegisteredPlayerQuery): Promise<[RegisteredPlayer[], number, number]>
    {
        options.pageSize = _.clamp(options.pageSize ?? MAX_PAGE_SIZE_WITH_STEAMID, 1, MAX_PAGE_SIZE_WITH_STEAMID);
        options.page = options.page ?? 1;
        options.search = options.search ?? "";

        const ret = await this.registeredPlayerRepository.findAndCount({
            take: options.pageSize,
            skip: options.pageSize * (options.page - 1),
            order: {id: "DESC"},
            where: options.search.length >= MIN_SEARCH_LEN ? {steamId64: options.search} : undefined,
        });

        return [ret[0], ret[1], Math.ceil(ret[1] / options.pageSize)];
    }
    
    /**
     * Delete registered player
     * @param options 
     */
    async deleteRegisteredPlayer(options: IRegisteredPlayerIdentifier): Promise<void>
    {
        await this.connection
        .createQueryBuilder()
        .delete()
        .from(RegisteredPlayer)
        .where(!!options.id ? "id = :id" : "steamId64 = :steamId64", !!options.id ? { id: options.id } : { steamId64: steamId64ToAccountId(options.steamId64) })
        .execute();
    }

}
