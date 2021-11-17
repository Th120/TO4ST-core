import axios from 'axios';

import { Thunder } from './generated-core/zeus';
import { Logger } from "@nestjs/common";

export type TApiClient = {
    client: ReturnType<typeof Thunder>;
    setTransactionId: (transactionId: string) => string;
};

export function createGraphqlClientTo4stCore(url: string, timeout = 5000): TApiClient
{
    let currentTransationId = "";
    const changeTransactionId = (transactionId: string) => currentTransationId = transactionId;
    return {
        client: Thunder(async (query, variables) => 
            {
                const res = await axios.post(`${url}/graphql`, { query, variables }, 
                {
                    timeout: timeout,
                    headers:  
                    {
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json',
                        'x-request-id': currentTransationId
                    } 
                })

                // throw graphql errors
                if(!!res.data["errors"])
                {
                    throw res.data["errors"];
                }

                return res.data["data"];
            }, 
        (query) => {
            Logger.log(query);
        }),
        setTransactionId: changeTransactionId
    };
}

