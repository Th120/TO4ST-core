import axios from 'axios';

import { Thunder } from './generated-master/zeus';
import { Logger } from "@nestjs/common";

export function createGraphqlClientTo4stMaster(url: string, masterserverKey, timeout = 5000)
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
                        "Authorization": `MasterserverKey ${masterserverKey}`,
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json',
                        'x-request-id': currentTransationId
                    } 
                })

                return res.data;
            }, 
        (query) => {
            Logger.log(query);
        }),
        setTransactionId: changeTransactionId
    };
}

