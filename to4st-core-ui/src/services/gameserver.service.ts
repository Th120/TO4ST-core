import { TApiClient } from "../libs/api";
import {
  GameserverConfigOrder,
  GraphQLTypes,
  InputType,
  Selectors,
  ValueTypes,
} from "../libs/client/zeus";

const gameserverQuery = (
  page: number,
  pageSize: number,
  search: string,
  orderDesc: boolean,
  orderBy?: GameserverConfigOrder
) =>
  Selectors.query({
    gameservers: [
      {
        options: {
          pageSize: pageSize,
          page: page,
          search: search,
          orderDesc: orderDesc,
          orderBy: orderBy || GameserverConfigOrder.currentName,
        },
      },
      {
        pageCount: true,
        totalCount: true,
        content: {
          id: true,
          authKey: true,
          currentName: true,
          description: true,
          lastContact: true,
          gameserverConfig: {
            currentMatchConfig: {
              id: true,
              configName: true,
              gameMode: {
                name: true,
              },
              configHash: true,
              matchEndLength: true,
              warmUpLength: true,
              friendlyFireScale: true,
              mapLength: true,
              roundLength: true,
              preRoundLength: true,
              roundEndLength: true,
              roundLimit: true,
              allowGhostcam: true,
              playerVoteThreshold: true,
              autoBalanceTeams: true,
              playerVoteTeamOnly: true,
              maxTeamDamage: true,
              enablePlayerVote: true,
              autoSwapTeams: true,
              midGameBreakLength: true,
              nadeRestriction: true,
              globalVoicechat: true,
              muteDeadToTeam: true,
              ranked: true,
              private: true,
            },
            currentName: true,
            voteLength: true,
            gamePassword: true,
            reservedSlots: true,
            balanceClans: true,
            allowSkipMapVote: true,
            tempKickBanTime: true,
            autoRecordReplay: true,
            playerGameControl: true,
            enableMapVote: true,
            serverAdmins: true,
            serverDescription: true,
            website: true,
            contact: true,
            mapNoReplay: true,
            enableVoicechat: true,
          },
        },
      },
    ],
  });

type TGameserverApi = InputType<
  GraphQLTypes["Query"],
  ReturnType<typeof gameserverQuery>
>["gameservers"]["content"][number];
const mapGameserver = (x: TGameserverApi) => ({
  ...x,
  lastContact: new Date(x.lastContact),
});
export type TGameserver = ReturnType<typeof mapGameserver>;
export const extractGameserverConfig: (
  gameserver: TGameserver,
  defaultGameserverConfig: Omit<TGameserverConfig, "gameserver">
) => TGameserverConfig | undefined = (
  gameserver: TGameserver,
  defaultGameserverConfig: Omit<TGameserverConfig, "gameserver">
) =>
  !gameserver.gameserverConfig
    ? { ...defaultGameserverConfig, gameserver: gameserver }
    : { ...gameserver.gameserverConfig, gameserver: gameserver };
export type TGameserverConfig = TGameserver["gameserverConfig"] & {
  gameserver: TGameserver;
};

const matchConfigsQuery = (
  page: number,
  pageSize: number,
  search: string,
  orderDesc: boolean
) =>
  Selectors.query({
    matchConfigs: [
      {
        options: {
          page: page,
          pageSize: pageSize,
          configName: search,
          orderDesc: orderDesc,
        },
      },
      {
        pageCount: true,
        totalCount: true,
        content: {
          id: true,
          configName: true,
          gameMode: {
            name: true,
          },
          configHash: true,
          matchEndLength: true,
          warmUpLength: true,
          friendlyFireScale: true,
          mapLength: true,
          roundLength: true,
          preRoundLength: true,
          roundEndLength: true,
          roundLimit: true,
          allowGhostcam: true,
          playerVoteThreshold: true,
          autoBalanceTeams: true,
          playerVoteTeamOnly: true,
          maxTeamDamage: true,
          enablePlayerVote: true,
          autoSwapTeams: true,
          midGameBreakLength: true,
          nadeRestriction: true,
          globalVoicechat: true,
          muteDeadToTeam: true,
          ranked: true,
          private: true,
        },
      },
    ],
  });

export type TMatchConfig = InputType<
  GraphQLTypes["Query"],
  ReturnType<typeof matchConfigsQuery>
>["matchConfigs"]["content"][number];

const gamemodeQuery = () =>
  Selectors.query({
    gameModes: {
      pageCount: true,
      totalCount: true,
      content: {
        name: true,
      },
    },
  });

export type TGameMode = InputType<
  GraphQLTypes["Query"],
  ReturnType<typeof gamemodeQuery>
>["gameModes"]["content"][number];

export class GameserverService {
  public static get(client: TApiClient) {
    return {
      gameservers: async (
        page: number,
        pageSize: number,
        search: string,
        orderDesc: boolean,
        orderBy?: GameserverConfigOrder
      ) => {
        const result = await client.client.query(
          gameserverQuery(page, pageSize, search, orderDesc, orderBy)
        );
        return [
          result.gameservers.content.map((x) => mapGameserver(x)),
          result.gameservers.pageCount,
          result.gameservers.totalCount,
        ] as const;
      },
      createUpdateGameserverConfig: async (
        gameserverConfig: ValueTypes["GameserverConfigInput"],
        transactionId: string
      ) => {
        client.setTransactionId(transactionId);
        await client.client.mutation({
          createUpdateGameserverConfig: [
            {
              gameserverConfig: gameserverConfig,
            },
            {
              gameserver: { id: true },
            },
          ],
        });
      },
      deleteGameserverConfig: async (gameserverId: string) => {
        await client.client.mutation({
          deleteGameserverConfig: [
            {
              gameserverId: gameserverId,
            },
            true,
          ],
        });
      },
      createUpdateGameserver: async (
        gameserver: ValueTypes["GameserverInput"],
        transactionId: string
      ) => {
        client.setTransactionId(transactionId);
        await client.client.mutation({
          createUpdateGameserver: [
            {
              gameserver: gameserver,
            },
            {
              id: true,
            },
          ],
        });
      },
      deleteGameserver: async (gameserverId: string) => {
        await client.client.mutation({
          deleteGameserver: [
            {
              gameserverId: gameserverId,
            },
            true,
          ],
        });
      },
      gamemodes: async () => {
        const result = (await client.client.query(gamemodeQuery())).gameModes;
        return [result.content, result.pageCount, result.totalCount] as const;
      },
      matchConfigs: async (
        page: number,
        pageSize: number,
        search: string,
        orderDesc: boolean
      ) => {
        const result = await client.client.query(
          matchConfigsQuery(page, pageSize, search, orderDesc)
        );
        return [
          result.matchConfigs.content,
          result.matchConfigs.pageCount,
          result.matchConfigs.totalCount,
        ] as const;
      },
      deleteMatchConfig: async (id: number) => {
        await client.client.mutation({
          deleteMatchConfig: [
            {
              options: {
                id: id,
              },
            },
            true,
          ],
        });
      },
      createUpdateMatchConfig: async (
        matchConfig: ValueTypes["MatchConfigInput"],
        transactionId: string
      ) => {
        client.setTransactionId(transactionId);
        await client.client.mutation({
          createUpdateMatchConfig: [
            {
              matchConfig: matchConfig,
            },
            {
              id: true,
            },
          ],
        });
      },
    };
  }
}
