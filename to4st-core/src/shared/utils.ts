import {
  fromAccountID,
  ID,
} from '@node-steam/id';
import moment from 'moment';
import { ValueTransformer } from 'typeorm';
import jsSHA from "jssha";
import {registerEnumType } from "@nestjs/graphql"
import _ from 'lodash';

/**
 * Transformer used to store steamId64 as accountId in Database
 */
export const transformSteamId64AccountId: ValueTransformer = {
  to: (entityValue: string): number => steamId64ToAccountId(entityValue),
  from: (databaseValue: number): string => accountIdToSteamId64(databaseValue)
};

/**
 * Enum for Teams
 */
export enum Team {
  NONE = "None",
  SF = "Special Forces",
  TERR = "Terrorists"
}

/**
 * Register enum in GraphQL
 */
registerEnumType(Team, {
  name: "Team",
});

/**
 * Transformer used to store team enum as number
 */
export const transformTeam: ValueTransformer = {
  to: (entityValue: Team): number => entityValue === Team.TERR ? 2 : (entityValue === Team.SF ? 1 : 0),
  from: (databaseValue: number): Team => databaseValue === 2 ? Team.TERR : (databaseValue === 1 ? Team.SF : Team.NONE)
};

/**
 * Transform steamId to accountId
 * @param steamId64 
 * @returns accountId
 */
export function steamId64ToAccountId(steamId64: string): number
{
   steamId64 = steamId64.trim();

    try
    {
      const steamId = new ID(steamId64);

     return steamId.isValid() ? steamId.getAccountID() : 0;
    }
    catch(e)
    {
      
    }
    
    return -1;
}

/**
 * Checks steamId 
 * @returns is valid steamId
 */
export function isValidSteamId(steamId64: string): boolean
{
    return steamId64ToAccountId(steamId64) > 0;
}

/**
 * Convert steam accountId to steamId64
 * @param accountId 
 */
export function accountIdToSteamId64(accountId: number): string
{
  return !!accountId ? fromAccountID(accountId).getSteamID64() : "0";
}

/**
 * Helper to allow async iteration over array
 * @param array 
 * @param callback async function
 */
export async function asyncForEach<T>(array:T[], callback: (elem: T, index: number, array: T[]) => Promise<void>) {
  for (let i = 0; i < array.length; i++) {
      await callback(array[i], i, array);
  }
}

/**
 * Checks whether keys of objects match
 * Compares primitives and key names, content of value ignored if object
 * @param source 
 * @param subset 
 */
export function keysMatch(source: Record<string, any>, subset: Record<string, any>): boolean 
{
    if (source === null || subset === null || typeof  source !== 'object' || typeof subset !== 'object' ) 
    {
      return false;
    }

    if (source instanceof Date || subset instanceof Date)
    {
      return source.valueOf() === subset.valueOf();
    } 

    return Object.keys(subset).every((key) => 
    {
      if (!source.propertyIsEnumerable(key))
      {
        return false;
      }
      
      const sourceItem = source[key];
      const subsetItem = subset[key];
        
      return sourceItem === subsetItem || subsetItem !== null && typeof subsetItem === 'object';
    });
};

/**
 * Treats array as ring and returns content based on offset, jumps to first index of array if end reached
 * @param arr 
 * @param n number of elements to take
 * @param offset offset from start
 */
export function getNextNFromRingArray<T>(arr:T[], n: number, offset: number) 
{
  return _.range(n).map(i => arr[(offset + i) % arr.length]);
}

/**
 * Naive salting + password hash
 * @param pass 
 */
export function hashPassword(pass: string)
{
    const shaObj = new jsSHA("SHA3-256", "TEXT");
    shaObj.update(pass);
    shaObj.update("T04ST"); //salt just in case
    return shaObj.getHash("HEX");
}

/**
 * Maps date to string in order to use it with QueryBuilder
 * @param date 
 */
export function mapDateForQuery(date: Date)
{
  const formatted = moment.utc(roundDate(date)).format("YYYY-MM-DD HH:mm:ss");
  return formatted;
}

/**
 * Removes ms from date
 * @param date 
 */
export function roundDate(date: Date)
{
  const mapped = moment.utc(date).startOf("second").toDate();
  return mapped;
}

/**
 * Factory for a timeout promise, can be cancelled, allows to use a random time within a range
 * @param minTime minimal Time of range, default duration if maxTime not defined
 * @param maxTime maxTime for random time range
 * @returns Promise of timeout to await, callback to clear timeout
 */
export const TIMEOUT_PROMISE_FACTORY: (minTime: number, maxTime?: number) => [Promise<null>, () => void] = (minTime: number, maxTime?: number) => {
  
  let time = minTime;
  
  if(maxTime)
  {
    time = _.random(minTime, maxTime);
  }

  let cb: () => void = () => {};

  const promise: Promise<null> = new Promise((resolve, reject) => {
    const x = setTimeout(() => resolve(null), time);
    cb = () => {
      clearTimeout(x);
      reject();
    };
  });

  return [promise, cb];
};


  