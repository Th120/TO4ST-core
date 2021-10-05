import { Thunder } from "./client/zeus";

/**
 * Get an api client
 * @param bearerToken
 */
export function createAPI(bearerToken = ""): TApiClient {
  let currentTransationId = "";
  const changeTransactionId = (transactionId: string) =>
    (currentTransationId = transactionId);
  return {
    client: Thunder(
      async (query, variables) => {
        const fetched = await fetch(
          `${
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000"
              : window.location.origin
          }/graphql`,
          {
            method: "POST",
            body: JSON.stringify({ query, variables }),
            headers:
              bearerToken === ""
                ? {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "x-request-id": currentTransationId,
                  }
                : {
                    Authorization: `Bearer ${bearerToken}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "x-request-id": currentTransationId,
                  },
          }
        );

        const decoded = await fetched.json();
        
        if(!!decoded.errors) {
          throw decoded;
        }

        return decoded.data;
      },
      (query) => {
        console.log(query);
      }
    ),
    setTransactionId: changeTransactionId,
  };
}

export type TApiClient = {
  client: ReturnType<typeof Thunder>;
  setTransactionId: (transactionId: string) => string;
};
