import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { EntitySchema } from "typeorm";
import { chance } from 'jest-chance';
import * as realChance from "chance";
import _ from "lodash";

import { monkeypatch as monkeyPostgres } from './libs/db/pg-utc-timestamp-monkey-patch';
import { monkeypatch as monkeySQLite } from './libs/db/sqlite-concurrent-transtactions-monkey-patch';
import { accountIdToSteamId64, getNextNFromRingArray } from './shared/utils';
import { Logger } from "@nestjs/common";

/**
 * Min N used for bulk insert tests
 */
export const MIN_N = 10;
/**
 * default N used for bulk insert / delete tests
 */
export const N = Math.max(500, MIN_N);

/**
 * Range of valid accountIds start
 */
const RANGE_STEAMID_START = 974995995;

/**
 * Range of valid accountIds size
 */
const RANGE_STEAMID_COUNT = 4995995;

/**
 * Range of mostly valid accountIds
 */
const RANGE_STEAMIDS = () => _.range(RANGE_STEAMID_START, RANGE_STEAMID_COUNT + RANGE_STEAMID_START);

/**
 * Async for N loop used in tests to insert N entities
 * @param func 
 */
export async function forN(func: (idx: number) => Promise<void>)
{
    for(let i = 0; i < N; i++)
    {
       await func(i);
    }
}

/**
 * Get a random date within a date range
 * @param a 
 * @param b 
 */
export function randomDateInRange(a: Date, b: Date)
{
    return new Date(chance.integer({min: a.valueOf() > b.valueOf() ? b.valueOf() : a.valueOf(), max: a.valueOf() > b.valueOf() ? a.valueOf() : b.valueOf()}));
}

/**
 * Checks whether date is in range
 * @param date 
 * @param rangeA 
 * @param rangeB 
 */
export function dateIsInRange(date: Date, rangeA: Date, rangeB: Date)
{
    return date.valueOf() >= rangeA.valueOf() && date.valueOf() <= rangeB.valueOf();
}

/**
 * List of valid steam ids to test with, is only filled if the generator methods are used
 */
let VALID_STEAM_IDS: number[] = [];

/**
 * Random steamId64 
 * @returns random steamId64 string
 */
export function randomSteamId64(): string
{
    if(VALID_STEAM_IDS.length === 0)
    {
        VALID_STEAM_IDS = RANGE_STEAMIDS();
    }

    return accountIdToSteamId64(VALID_STEAM_IDS[chance.integer({min: 0}) % VALID_STEAM_IDS.length]);
}

/**
 * Construct array of random steamId64
 * @param options 
 */
export function randomSteamId64s(options: {count: number, seed: number}): string[]
{
    if(VALID_STEAM_IDS.length === 0)
    {
        VALID_STEAM_IDS = RANGE_STEAMIDS();
    }

    const currChance = new realChance.Chance(options.seed);

    return getNextNFromRingArray(VALID_STEAM_IDS, options.count, currChance.integer({min: 0}) % VALID_STEAM_IDS.length).map(x => accountIdToSteamId64(x));
}

/**
 * Construct test typeorm config
 * @param entities 
 */
export function genTypeORMTestCFG(entities: (string | Function | EntitySchema<any>)[]){

    process.env.TZ = "UTC" // Just in case pg

    process.env.DATABASE_TYPE = process.env.TEST_DB || "sqlite";

    if(!process.env.TEST_DB)
    {
        Logger.log(`TEST_DB not set in env, using ${process.env.DATABASE_TYPE}`, "Init database");
    }
    
    let options: TypeOrmModuleOptions = null;

    if(process.env.DATABASE_TYPE === "sqlite")
    {
        monkeySQLite();

        options = {
            type: "sqlite",
            database: ":memory:",
            entities: entities,
            synchronize: true, 
            logging: false,
            dropSchema: true,
        };
        /*
        {
            type: "sqlite",
            database: "./../sqlite/testdb-core.sqlite",
            entities: entities,
            synchronize: true, 
            logging: false,
            dropSchema: true
        };
        */
    }
    else if(process.env.DATABASE_TYPE === "mysql")
    {
        options = { 
            type: "mysql",
            database: "to4st-core-test",
            host: "127.0.0.1",
            port: 3306,
            username: "to4user",
            password: "to4password",
            entities: entities,
            synchronize: true, 
            logging: false,
            dropSchema: true,
            timezone: "utc"
        };
    }
    else 
    {
        monkeyPostgres();
        options =  { 
            type: "postgres",
            database: "to4st-core-test",
            host: "127.0.0.1",
            port: 5432,
            username: "postgres",
            password: "th120",
            entities: entities,
            synchronize: true, 
            logging: false,
            dropSchema: true,
        };
    }

    return TypeOrmModule.forRoot(options);
}