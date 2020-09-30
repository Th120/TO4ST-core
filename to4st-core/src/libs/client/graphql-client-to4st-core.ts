
import { Client, linkTypeMap, createClient } from "./typed-client";
import { QueryRequest, QueryPromiseChain, Query, MutationRequest, MutationPromiseChain, Mutation } from "./api-client-to4st-core/schema";
import _typeMap from "./api-client-to4st-core/typeMap.json";
import axios, { AxiosInstance } from 'axios';

/**
 * GraphQL typed client interface
 */
export interface APIClient 
{
    client:  Client<QueryRequest, QueryPromiseChain, Query, MutationRequest, MutationPromiseChain, Mutation, never, never, never>;
    setTransactionId: (transactionId: string) => void;
}

/**
 * Create a GraphQL client for a core api
 * @param url 
 * @param timeout timeout for request 
 */
export function createGraphqlClientTo4stCore(url: string, timeout = 5000): APIClient
{
    const typeMap = linkTypeMap(_typeMap as any);
    let currentTransationId = "";
    const changeTransactionId = (transactionId: string) => currentTransationId = transactionId;
    
    return {
        client: createClient({
        fetcher: ({ query, variables }, fetch, qs) =>
            axios.post(`${url}/graphql`, { query, variables }, 
            {
                timeout: timeout,
                headers:  
                {
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json',
                    'x-request-id': currentTransationId
                } 
            }).then(r => Promise.resolve(r.data)),
            queryRoot: typeMap.Query,
            mutationRoot: typeMap.Mutation,
        }),
        setTransactionId: changeTransactionId
    };
}


export * from "./api-client-to4st-core/schema";
