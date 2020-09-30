
import { Client, linkTypeMap, createClient } from './typed-client';
import { QueryRequest, QueryPromiseChain, Query, MutationRequest, MutationPromiseChain, Mutation } from "./api-client-to4st-master/schema";
import _typeMap from "./api-client-to4st-master/typeMap.json";
import axios, { AxiosInstance } from 'axios';

/**
 * GraphQL typed client interface
 */
export type APIClient = Client<
    QueryRequest, QueryPromiseChain, Query, MutationRequest, 
    MutationPromiseChain, Mutation, never, never, never
>;

/**
 * Create a GraphQL client for masterserver api
 * @param url 
 * @param masterserverKey 
 * @param timeout 
 */
export function createGraphqlClientTo4stMaster(url: string, masterserverKey: string, timeout = 5000): APIClient
{
    const typeMap = linkTypeMap(_typeMap as any);
    return createClient({
        fetcher: ({ query, variables }, fetch, qs) =>
            axios.post(`${url}/graphql`, { query, variables }, 
            {
                timeout: timeout,
                headers: {
                    "Authorization": `MasterserverKey ${masterserverKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }, 
            }).then(r => Promise.resolve(r.data)
        ),
        queryRoot: typeMap.Query,
        mutationRoot: typeMap.Mutation,
    });
}


export * from "./api-client-to4st-master/schema";
