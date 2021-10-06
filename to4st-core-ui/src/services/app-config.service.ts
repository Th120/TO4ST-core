import { TApiClient } from "../libs/api";
import {
  GraphQLTypes,
  InputType,
  Selectors,
  ValueTypes,
} from "../libs/client/zeus";

const loginMutation = (password: string) =>
  Selectors.mutation({
    login: [
      {
        password: password,
      },
      {
        jwt: true,
        appConfig: {
          instanceId: true,
          publicStats: true,
          publicBanQuery: true,
          banlistPartners: true,
          masterserverKey: true,
          steamWebApiKey: true,
          ownAddress: true,
          minScoreStats: true,
          playerStatsCacheAge: true,
          appInfo: {
            uniquePlayers: true,
            gamesPlayed: true,
            roundsPlayed: true,
            activeBans: true,
          },
        },
      },
    ],
  });

export type TLoginInfoApi = InputType<
  GraphQLTypes["Mutation"],
  ReturnType<typeof loginMutation>
>["login"];

const appConfigMutation = (appConfig: ValueTypes["AppConfigInput"]) =>
  Selectors.mutation({
    updateAppConfig: [
      {
        appConfig: appConfig,
      },
      {
        instanceId: true,
        publicStats: true,
        publicBanQuery: true,
        banlistPartners: true,
        masterserverKey: true,
        steamWebApiKey: true,
        ownAddress: true,
        minScoreStats: true,
        playerStatsCacheAge: true,
        appInfo: {
          uniquePlayers: true,
          gamesPlayed: true,
          roundsPlayed: true,
          activeBans: true,
        },
      },
    ],
  });

const appInfoQuery = (cached = true) =>
  Selectors.query({
    appConfig: [
      {
        cached: cached,
      },
      {
        instanceId: true,
        publicStats: true,
        publicBanQuery: true,
        banlistPartners: true,
        masterserverKey: true,
        steamWebApiKey: true,
        ownAddress: true,
        minScoreStats: true,
        playerStatsCacheAge: true,
        appInfo: {
          uniquePlayers: true,
          gamesPlayed: true,
          roundsPlayed: true,
          activeBans: true,
        },
      },
    ],
  });

export type TAppInfoApi =
  | InputType<
      GraphQLTypes["Mutation"],
      ReturnType<typeof appConfigMutation>
    >["updateAppConfig"]
  | InputType<
      GraphQLTypes["Query"],
      ReturnType<typeof appInfoQuery>
    >["appConfig"];

export type TAppConfigInput = ValueTypes["AppConfigInput"];

export class AppConfigService {
  public static get(client: TApiClient) {
    return {
      appInfo: async (cached = true) => {
        const result: TAppInfoApi = (
          await client.client.query(appInfoQuery(cached))
        ).appConfig;
        return result;
      },
      createUpdateAppConfig: async (appConfig: TAppConfigInput) => {
        const updated: TAppInfoApi = (
          await client.client.mutation(appConfigMutation(appConfig))
        ).updateAppConfig;
        return updated;
      },
      login: async (password: string) => {
        const updated: TLoginInfoApi = (
          await client.client.mutation(loginMutation(password))
        ).login;
        return updated;
      },
      authValid: async () => {
        const updated: boolean = (
          await client.client.query({ authValid: true })
        ).authValid;
        return updated;
      },
    };
  }
}
