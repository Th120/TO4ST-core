
import { Client, linkTypeMap, createClient } from "graphql-typed-client";
import { QueryRequest, QueryPromiseChain, Query, MutationRequest, MutationPromiseChain, Mutation } from "./api-client/schema";
import _typeMap from "./api-client/typeMap.json";

/**
 * Interface for API client
 */
export interface APIClient 
{
    /**
     * GraphQL client
     */
    client:  Client<QueryRequest, QueryPromiseChain, Query, MutationRequest, MutationPromiseChain, Mutation, never, never, never>;

    /**
     * Set transtaction id which is needed for create operations
     */
    setTransactionId: (transactionId: string) => void;
}


/**
 * Get an api client
 * @param bearerToken 
 */
export function createAPI(bearerToken = ""): APIClient
{
    const typeMap = linkTypeMap(_typeMap as any);
    let currentTransationId = "";
    const changeTransactionId = (transactionId: string) => currentTransationId = transactionId;
    return {
        client: createClient({
            fetcher: ({ query, variables }, fetch) =>
                fetch(`${process.env.NODE_ENV === "development" ?  "http://localhost:3000" : window.location.origin}/graphql`, {
                    method: "POST",
                    body: JSON.stringify({ query, variables }),
                    headers: bearerToken === "" ? 
                    {
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json',
                        'x-request-id': currentTransationId
                    } 
                    : 
                    {
                    "Authorization": `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-request-id': currentTransationId
                    }
                }).then(r => r.json()),
            queryRoot: typeMap.Query,
            mutationRoot: typeMap.Mutation,
            }), 
        setTransactionId: changeTransactionId
    };
}

export * from "./api-client/schema";
