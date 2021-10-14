/* eslint-disable */

import { AllTypesProps, ReturnTypes } from "./const";
type ZEUS_INTERFACES = never;
type ZEUS_UNIONS = never;

export type ValueTypes = {
  ["GameMode"]: AliasType<{
    name?: true;
    isTeamBased?: true;
    __typename?: true;
  }>;
  ["MatchConfig"]: AliasType<{
    id?: true;
    configName?: true;
    gameMode?: ValueTypes["GameMode"];
    configHash?: true;
    matchEndLength?: true;
    warmUpLength?: true;
    friendlyFireScale?: true;
    mapLength?: true;
    roundLength?: true;
    preRoundLength?: true;
    roundEndLength?: true;
    roundLimit?: true;
    allowGhostcam?: true;
    playerVoteThreshold?: true;
    autoBalanceTeams?: true;
    playerVoteTeamOnly?: true;
    maxTeamDamage?: true;
    enablePlayerVote?: true;
    autoSwapTeams?: true;
    midGameBreakLength?: true;
    nadeRestriction?: true;
    globalVoicechat?: true;
    muteDeadToTeam?: true;
    ranked?: true;
    private?: true;
    __typename?: true;
  }>;
  ["GameserverConfig"]: AliasType<{
    gameserver?: ValueTypes["Gameserver"];
    currentMatchConfig?: ValueTypes["MatchConfig"];
    currentName?: true;
    voteLength?: true;
    gamePassword?: true;
    reservedSlots?: true;
    balanceClans?: true;
    allowSkipMapVote?: true;
    tempKickBanTime?: true;
    autoRecordReplay?: true;
    playerGameControl?: true;
    enableMapVote?: true;
    serverAdmins?: true;
    serverDescription?: true;
    website?: true;
    contact?: true;
    mapNoReplay?: true;
    enableVoicechat?: true;
    __typename?: true;
  }>;
  ["Gameserver"]: AliasType<{
    id?: true;
    authKey?: true;
    currentName?: true;
    description?: true;
    lastContact?: true;
    gameserverConfig?: ValueTypes["GameserverConfig"];
    __typename?: true;
  }>;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  ["DateTime"]: unknown;
  ["ServerMap"]: AliasType<{
    name?: true;
    __typename?: true;
  }>;
  ["Game"]: AliasType<{
    id?: true;
    gameserver?: ValueTypes["Gameserver"];
    matchConfig?: ValueTypes["MatchConfig"];
    startedAt?: true;
    endedAt?: true;
    map?: ValueTypes["ServerMap"];
    gameMode?: ValueTypes["GameMode"];
    rounds?: ValueTypes["Round"];
    __typename?: true;
  }>;
  ["AppConfig"]: AliasType<{
    instanceId?: true;
    publicStats?: true;
    banlistPartners?: true;
    publicBanQuery?: true;
    masterserverKey?: true;
    steamWebApiKey?: true;
    ownAddress?: true;
    playerStatsCacheAge?: true;
    minScoreStats?: true;
    appInfo?: ValueTypes["AppInfo"];
    __typename?: true;
  }>;
  ["Round"]: AliasType<{
    id?: true;
    game?: ValueTypes["Game"];
    startedAt?: true;
    endedAt?: true;
    scoreSpecialForces?: true;
    scoreTerrorists?: true;
    playerRoundStats?: ValueTypes["PlayerRoundStats"];
    playerRoundWeaponStats?: ValueTypes["PlayerRoundWeaponStats"];
    __typename?: true;
  }>;
  ["PlayerRoundStats"]: AliasType<{
    round?: ValueTypes["Round"];
    steamId64?: true;
    kills?: true;
    deaths?: true;
    suicides?: true;
    totalDamage?: true;
    score?: true;
    team?: true;
    steamUser?: ValueTypes["SteamUser"];
    __typename?: true;
  }>;
  ["Team"]: Team;
  ["Weapon"]: AliasType<{
    name?: true;
    weaponType?: true;
    __typename?: true;
  }>;
  ["WeaponType"]: WeaponType;
  ["PlayerRoundWeaponStats"]: AliasType<{
    steamId64?: true;
    round?: ValueTypes["Round"];
    weapon?: ValueTypes["Weapon"];
    totalDamage?: true;
    shotsHead?: true;
    shotsChest?: true;
    shotsLegs?: true;
    shotsArms?: true;
    shotsFired?: true;
    steamUser?: ValueTypes["SteamUser"];
    __typename?: true;
  }>;
  ["SteamUser"]: AliasType<{
    steamId64?: true;
    name?: true;
    avatarBigUrl?: true;
    avatarMediumUrl?: true;
    __typename?: true;
  }>;
  ["PaginatedGame"]: AliasType<{
    content?: ValueTypes["Game"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedGameMode"]: AliasType<{
    content?: ValueTypes["GameMode"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedPlayerRoundStats"]: AliasType<{
    content?: ValueTypes["PlayerRoundStats"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedPlayerRoundWeaponStats"]: AliasType<{
    content?: ValueTypes["PlayerRoundWeaponStats"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedRound"]: AliasType<{
    content?: ValueTypes["Round"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PlayerStatistics"]: AliasType<{
    steamId64?: true;
    rank?: true;
    kills?: true;
    deaths?: true;
    suicides?: true;
    killDeathRatio?: true;
    totalScore?: true;
    totalDamage?: true;
    numberGamesPlayed?: true;
    numberRoundsPlayed?: true;
    avgDamagePerRound?: true;
    avgScorePerRound?: true;
    steamUser?: ValueTypes["SteamUser"];
    __typename?: true;
  }>;
  ["PlayerWeaponStatistics"]: AliasType<{
    steamId64?: true;
    totalDamage?: true;
    totalShots?: true;
    shotsChest?: true;
    shotsLegs?: true;
    shotsArms?: true;
    shotsHead?: true;
    weapon?: ValueTypes["Weapon"];
    steamUser?: ValueTypes["SteamUser"];
    __typename?: true;
  }>;
  ["PaginatedPlayerStatistics"]: AliasType<{
    content?: ValueTypes["PlayerStatistics"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedGameserver"]: AliasType<{
    content?: ValueTypes["Gameserver"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["Ban"]: AliasType<{
    id?: true;
    steamId64?: true;
    bannedById64?: true;
    createdAt?: true;
    expiredAt?: true;
    reason?: true;
    gameserver?: ValueTypes["Gameserver"];
    id1?: true;
    id2?: true;
    bannedSteamUser?: ValueTypes["SteamUser"];
    bannedBySteamUser?: ValueTypes["SteamUser"];
    __typename?: true;
  }>;
  ["RegisteredPlayer"]: AliasType<{
    steamId64?: true;
    visibleRole?: true;
    rootAdmin?: true;
    kick?: true;
    ban?: true;
    tempKickBan?: true;
    mute?: true;
    makeTeams?: true;
    reservedSlots?: true;
    broadcastMessage?: true;
    gameControl?: true;
    steamUser?: ValueTypes["SteamUser"];
    __typename?: true;
  }>;
  ["AuthKey"]: AliasType<{
    id?: true;
    authKey?: true;
    description?: true;
    lastUse?: true;
    __typename?: true;
  }>;
  ["PaginatedRegisteredPlayers"]: AliasType<{
    content?: ValueTypes["RegisteredPlayer"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedBan"]: AliasType<{
    content?: ValueTypes["Ban"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedGameserverConfig"]: AliasType<{
    content?: ValueTypes["GameserverConfig"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedMatchConfig"]: AliasType<{
    content?: ValueTypes["MatchConfig"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["PaginatedAuthKey"]: AliasType<{
    content?: ValueTypes["AuthKey"];
    totalCount?: true;
    pageCount?: true;
    __typename?: true;
  }>;
  ["LoginResponse"]: AliasType<{
    appConfig?: ValueTypes["AppConfig"];
    jwt?: true;
    __typename?: true;
  }>;
  ["AppInfo"]: AliasType<{
    gamesPlayed?: true;
    roundsPlayed?: true;
    activeBans?: true;
    uniquePlayers?: true;
    __typename?: true;
  }>;
  ["Query"]: AliasType<{
    appConfig?: [{ cached?: boolean | null }, ValueTypes["AppConfig"]];
    authKeys?: [
      { options: ValueTypes["AuthKeyQuery"] },
      ValueTypes["PaginatedAuthKey"]
    ];
    authKey?: [{ authKey: string }, ValueTypes["AuthKey"]];
    authValid?: true;
    registeredPlayers?: [
      { options: ValueTypes["RegisteredPlayersQuery"] },
      ValueTypes["PaginatedRegisteredPlayers"]
    ];
    registeredPlayer?: [
      { options: ValueTypes["RegisteredPlayerQuery"] },
      ValueTypes["RegisteredPlayer"]
    ];
    bans?: [{ options: ValueTypes["BanQuery"] }, ValueTypes["PaginatedBan"]];
    banCheck?: [{ banCheck: ValueTypes["BanCheck"] }, ValueTypes["Ban"]];
    gameservers?: [
      { options: ValueTypes["GameserversQuery"] },
      ValueTypes["PaginatedGameserver"]
    ];
    gameserver?: [
      { options: ValueTypes["GameserverQuery"] },
      ValueTypes["Gameserver"]
    ];
    matchConfigs?: [
      { options: ValueTypes["MatchConfigsQuery"] },
      ValueTypes["PaginatedMatchConfig"]
    ];
    matchConfig?: [
      { options: ValueTypes["MatchConfigQuery"] },
      ValueTypes["MatchConfig"]
    ];
    gameserverConfigs?: [
      { options: ValueTypes["GameserverConfigsQuery"] },
      ValueTypes["PaginatedGameserverConfig"]
    ];
    gameserverConfig?: [
      { gameserverId?: string | null },
      ValueTypes["GameserverConfig"]
    ];
    games?: [{ options: ValueTypes["GameQuery"] }, ValueTypes["PaginatedGame"]];
    game?: [{ gameId: string }, ValueTypes["Game"]];
    rounds?: [
      { options: ValueTypes["RoundQuery"] },
      ValueTypes["PaginatedRound"]
    ];
    round?: [{ roundId: number }, ValueTypes["Round"]];
    gameModes?: ValueTypes["PaginatedGameMode"];
    playerRoundStats?: [
      { options: ValueTypes["PlayerRoundStatsQuery"] },
      ValueTypes["PaginatedPlayerRoundStats"]
    ];
    playerRoundWeaponStats?: [
      { options: ValueTypes["PlayerRoundWeaponStatsQuery"] },
      ValueTypes["PaginatedPlayerRoundWeaponStats"]
    ];
    playerStatistics?: [
      { options: ValueTypes["PlayerStatisticsQuery"] },
      ValueTypes["PaginatedPlayerStatistics"]
    ];
    playerWeaponStatistics?: [
      { options: ValueTypes["PlayerWeaponStatisticsQuery"] },
      ValueTypes["PlayerWeaponStatistics"]
    ];
    __typename?: true;
  }>;
  ["AuthKeyQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    search?: string | null;
    orderDesc?: boolean | null;
  };
  ["RegisteredPlayersQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    search?: string | null;
  };
  ["RegisteredPlayerQuery"]: {
    id?: number | null;
    steamId64?: string | null;
  };
  ["BanQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    search?: string | null;
    steamId64?: string | null;
    bannedBySteamId64?: string | null;
    id1?: string | null;
    id2?: string | null;
    orderDesc?: boolean | null;
    orderByExpirationDate?: boolean | null;
    noExpiredBans?: boolean | null;
  };
  ["BanCheck"]: {
    steamId64?: string | null;
    id1?: string | null;
    id2?: string | null;
    banId?: string | null;
    /** Ignored if request does not include authentification. */
    checkBanlistPartners?: boolean | null;
  };
  ["GameserversQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    orderDesc?: boolean | null;
    orderBy?: ValueTypes["GameserverConfigOrder"] | null;
    search?: string | null;
    configFilter?: ValueTypes["GameserverConfigFilter"] | null;
  };
  ["GameserverConfigOrder"]: GameserverConfigOrder;
  ["GameserverConfigFilter"]: GameserverConfigFilter;
  ["GameserverQuery"]: {
    id?: string | null;
    authKey?: string | null;
  };
  ["MatchConfigsQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    configName?: string | null;
    orderDesc?: boolean | null;
  };
  ["MatchConfigQuery"]: {
    id?: number | null;
    configName?: number | null;
  };
  ["GameserverConfigsQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    search?: string | null;
    orderDesc?: boolean | null;
    orderByGameserverName?: boolean | null;
  };
  ["GameQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    orderDesc?: boolean | null;
    orderByEndedAt?: boolean | null;
    gameserverId?: string | null;
    startedAfter?: ValueTypes["DateTime"] | null;
    startedBefore?: ValueTypes["DateTime"] | null;
    endedAfter?: ValueTypes["DateTime"] | null;
    endedBefore?: ValueTypes["DateTime"] | null;
    map?: ValueTypes["ServerMapInput"] | null;
    gameMode?: ValueTypes["GameModeInput"] | null;
    onlyFinishedGames?: boolean | null;
    rankedOnly?: boolean | null;
  };
  ["ServerMapInput"]: {
    name: string;
  };
  ["GameModeInput"]: {
    name: string;
    isTeamBased?: boolean | null;
  };
  ["RoundQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    orderDesc?: boolean | null;
    gameId?: string | null;
    startedAfter?: ValueTypes["DateTime"] | null;
    startedBefore?: ValueTypes["DateTime"] | null;
    onlyFinishedRounds?: boolean | null;
  };
  ["PlayerRoundStatsQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    roundId: number;
  };
  ["PlayerRoundWeaponStatsQuery"]: {
    page?: number | null;
    pageSize?: number | null;
    roundId?: number | null;
  };
  ["PlayerStatisticsQuery"]: {
    steamId64?: string | null;
    page?: number | null;
    pageSize?: number | null;
    orderDesc?: boolean | null;
    orderBy?: ValueTypes["OrderPlayerBaseStats"] | null;
    gameModeName?: string | null;
    roundId?: number | null;
    gameId?: string | null;
    startedAfter?: ValueTypes["DateTime"] | null;
    startedBefore?: ValueTypes["DateTime"] | null;
    endedAfter?: ValueTypes["DateTime"] | null;
    endedBefore?: ValueTypes["DateTime"] | null;
    onlyFinishedRounds?: boolean | null;
    /** Only possible if only using sorts */
    cachedIfPossible?: boolean | null;
    ranked?: boolean | null;
  };
  ["OrderPlayerBaseStats"]: OrderPlayerBaseStats;
  ["PlayerWeaponStatisticsQuery"]: {
    steamId64?: string | null;
    gameModeName?: string | null;
    roundId?: number | null;
    gameId?: string | null;
    startedAfter?: ValueTypes["DateTime"] | null;
    startedBefore?: ValueTypes["DateTime"] | null;
    endedAfter?: ValueTypes["DateTime"] | null;
    endedBefore?: ValueTypes["DateTime"] | null;
    onlyFinishedRounds?: boolean | null;
  };
  ["Mutation"]: AliasType<{
    updateAppConfig?: [
      { appConfig: ValueTypes["AppConfigInput"] },
      ValueTypes["AppConfig"]
    ];
    deleteAuthKey?: [{ authKey: string }, true];
    createUpdateAuthKey?: [
      { authKey: ValueTypes["AuthKeyInput"] },
      ValueTypes["AuthKey"]
    ];
    login?: [{ password: string }, ValueTypes["LoginResponse"]];
    loginDev?: [{ password: string }, ValueTypes["LoginResponse"]];
    deleteRegisteredPlayer?: [{ steamId64: string }, true];
    createUpdateRegisteredPlayer?: [
      { registeredPlayer: ValueTypes["RegisteredPlayerInput"] },
      ValueTypes["RegisteredPlayer"]
    ];
    deleteBan?: [{ banId: string }, true];
    createUpdateBan?: [{ banInput: ValueTypes["BanInput"] }, ValueTypes["Ban"]];
    deleteGameserver?: [{ gameserverId: string }, true];
    createUpdateGameserver?: [
      { gameserver: ValueTypes["GameserverInput"] },
      ValueTypes["Gameserver"]
    ];
    updateGameserver?: [
      { gameserverUpdate: ValueTypes["GameserverUpdateInput"] },
      ValueTypes["Gameserver"]
    ];
    authPlayerToken?: [{ steamId64: string }, true];
    deleteMatchConfig?: [{ options: ValueTypes["MatchConfigQuery"] }, true];
    createUpdateMatchConfig?: [
      { matchConfig: ValueTypes["MatchConfigInput"] },
      ValueTypes["MatchConfig"]
    ];
    deleteGameserverConfig?: [{ gameserverId: string }, true];
    createUpdateGameserverConfig?: [
      { gameserverConfig: ValueTypes["GameserverConfigInput"] },
      ValueTypes["GameserverConfig"]
    ];
    assignMatchConfig?: [
      { gameserverConfig: ValueTypes["GameserverConfigInput"] },
      ValueTypes["GameserverConfig"]
    ];
    deleteGames?: [{ gameInputs: ValueTypes["GameInput"][] }, true];
    createUpdateGame?: [
      { gameInput: ValueTypes["GameInput"] },
      ValueTypes["Game"]
    ];
    deleteRounds?: [{ roundInputs: ValueTypes["RoundInput"][] }, true];
    createUpdateRound?: [
      { roundInput: ValueTypes["RoundInput"] },
      ValueTypes["Round"]
    ];
    createUpdatePlayerRoundStats?: [
      { playerRoundStatsInput: ValueTypes["PlayerRoundStatsInput"][] },
      true
    ];
    createUpdatePlayerRoundWeaponStats?: [
      {
        playerRoundWeaponStatsInput: ValueTypes["PlayerRoundWeaponStatsInput"][];
      },
      true
    ];
    __typename?: true;
  }>;
  ["AppConfigInput"]: {
    publicStats?: boolean | null;
    banlistPartners?: string[];
    publicBanQuery?: boolean | null;
    masterserverKey?: string | null;
    steamWebApiKey?: string | null;
    /** How often is the playerStats cache recalculated (in min), 0 to disable */
    playerStatsCacheAge?: number | null;
    minScoreStats?: number | null;
    ownAddress?: string | null;
    password?: string | null;
  };
  ["AuthKeyInput"]: {
    id?: number | null;
    authKey?: string | null;
    description?: string | null;
  };
  ["RegisteredPlayerInput"]: {
    steamId64: string;
    rootAdmin?: boolean | null;
    visibleRole?: string | null;
    kick?: boolean | null;
    ban?: boolean | null;
    tempKickBan?: boolean | null;
    mute?: boolean | null;
    makeTeams?: boolean | null;
    reservedSlots?: boolean | null;
    broadcastMessage?: boolean | null;
    gameControl?: boolean | null;
  };
  ["BanInput"]: {
    banId?: string | null;
    steamId64?: string | null;
    id1?: string | null;
    id2?: string | null;
    bannedById64?: string | null;
    expiredAt?: ValueTypes["DateTime"] | null;
    reason?: string | null;
    gameserverId?: string | null;
  };
  ["GameserverInput"]: {
    id?: string | null;
    authKey?: string | null;
    currentName?: string | null;
    description?: string | null;
  };
  ["GameserverUpdateInput"]: {
    currentName?: string | null;
  };
  ["MatchConfigInput"]: {
    id?: number | null;
    configName?: string | null;
    gameMode?: ValueTypes["GameModeInput"] | null;
    matchEndLength?: number | null;
    warmUpLength?: number | null;
    mapLength?: number | null;
    roundLength?: number | null;
    preRoundLength?: number | null;
    roundEndLength?: number | null;
    roundLimit?: number | null;
    midGameBreakLength?: number | null;
    friendlyFireScale?: number | null;
    playerVoteThreshold?: number | null;
    maxTeamDamage?: number | null;
    allowGhostcam?: boolean | null;
    autoBalanceTeams?: boolean | null;
    playerVoteTeamOnly?: boolean | null;
    enablePlayerVote?: boolean | null;
    autoSwapTeams?: boolean | null;
    nadeRestriction?: boolean | null;
    globalVoicechat?: boolean | null;
    muteDeadToTeam?: boolean | null;
    ranked?: boolean | null;
    private?: boolean | null;
  };
  ["GameserverConfigInput"]: {
    gameserverId: string;
    currentMatchConfigId?: number | null;
    currentGameserverName?: string | null;
    voteLength?: number | null;
    tempKickBanTime?: number | null;
    gamePassword?: string | null;
    serverAdmins?: string | null;
    serverDescription?: string | null;
    website?: string | null;
    contact?: string | null;
    reservedSlots?: number | null;
    mapNoReplay?: number | null;
    balanceClans?: boolean | null;
    allowSkipMapVote?: boolean | null;
    autoRecordReplay?: boolean | null;
    playerGameControl?: boolean | null;
    enableMapVote?: boolean | null;
    enableVoicechat?: boolean | null;
  };
  ["GameInput"]: {
    id?: string | null;
    gameserverId?: string | null;
    matchConfigId?: number | null;
    startedAt?: ValueTypes["DateTime"] | null;
    endedAt?: ValueTypes["DateTime"] | null;
    map?: ValueTypes["ServerMapInput"] | null;
    gameMode?: ValueTypes["GameModeInput"] | null;
  };
  ["RoundInput"]: {
    id?: number | null;
    gameId?: string | null;
    startedAt?: ValueTypes["DateTime"] | null;
    endedAt?: ValueTypes["DateTime"] | null;
    scoreSpecialForces?: number | null;
    scoreTerrorists?: number | null;
  };
  ["PlayerRoundStatsInput"]: {
    roundId: number;
    steamId64: string;
    kills: number;
    deaths: number;
    suicides: number;
    totalDamage: number;
    score: number;
    team: ValueTypes["Team"];
  };
  ["PlayerRoundWeaponStatsInput"]: {
    roundId: number;
    steamId64: string;
    weapon: ValueTypes["WeaponInput"];
    totalDamage: number;
    shotsHead: number;
    shotsChest: number;
    shotsLegs: number;
    shotsArms: number;
    shotsFired: number;
  };
  ["WeaponInput"]: {
    name: string;
    weaponType: ValueTypes["WeaponType"];
  };
};

export type ModelTypes = {
  ["GameMode"]: {
    name: string;
    isTeamBased: boolean;
  };
  ["MatchConfig"]: {
    id: number;
    configName: string;
    gameMode: ModelTypes["GameMode"];
    configHash: string;
    matchEndLength: number;
    warmUpLength: number;
    friendlyFireScale: number;
    mapLength: number;
    roundLength: number;
    preRoundLength: number;
    roundEndLength: number;
    roundLimit: number;
    allowGhostcam: boolean;
    playerVoteThreshold: number;
    autoBalanceTeams: boolean;
    playerVoteTeamOnly: boolean;
    maxTeamDamage: number;
    enablePlayerVote: boolean;
    autoSwapTeams: boolean;
    midGameBreakLength: number;
    nadeRestriction: boolean;
    globalVoicechat: boolean;
    muteDeadToTeam: boolean;
    ranked: boolean;
    private: boolean;
  };
  ["GameserverConfig"]: {
    gameserver: ModelTypes["Gameserver"];
    currentMatchConfig?: ModelTypes["MatchConfig"];
    currentName: string;
    voteLength: number;
    gamePassword: string;
    reservedSlots: number;
    balanceClans: boolean;
    allowSkipMapVote: boolean;
    tempKickBanTime: number;
    autoRecordReplay: boolean;
    playerGameControl: boolean;
    enableMapVote: boolean;
    serverAdmins: string;
    serverDescription: string;
    website: string;
    contact: string;
    mapNoReplay: number;
    enableVoicechat: boolean;
  };
  ["Gameserver"]: {
    id: string;
    authKey?: string;
    currentName: string;
    description?: string;
    lastContact?: ModelTypes["DateTime"];
    gameserverConfig?: ModelTypes["GameserverConfig"];
  };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  ["DateTime"]: any;
  ["ServerMap"]: {
    name: string;
  };
  ["Game"]: {
    id: string;
    gameserver: ModelTypes["Gameserver"];
    matchConfig?: ModelTypes["MatchConfig"];
    startedAt: ModelTypes["DateTime"];
    endedAt?: ModelTypes["DateTime"];
    map: ModelTypes["ServerMap"];
    gameMode: ModelTypes["GameMode"];
    rounds: ModelTypes["Round"][];
  };
  ["AppConfig"]: {
    instanceId?: string;
    publicStats?: boolean;
    banlistPartners?: string[];
    publicBanQuery?: boolean;
    masterserverKey?: string;
    steamWebApiKey?: string;
    ownAddress?: string;
    playerStatsCacheAge?: number;
    minScoreStats?: number;
    appInfo: ModelTypes["AppInfo"];
  };
  ["Round"]: {
    id: number;
    game: ModelTypes["Game"];
    startedAt: ModelTypes["DateTime"];
    endedAt?: ModelTypes["DateTime"];
    scoreSpecialForces: number;
    scoreTerrorists: number;
    playerRoundStats?: ModelTypes["PlayerRoundStats"][];
    playerRoundWeaponStats?: ModelTypes["PlayerRoundWeaponStats"][];
  };
  ["PlayerRoundStats"]: {
    round: ModelTypes["Round"];
    steamId64: string;
    kills: number;
    deaths: number;
    suicides: number;
    totalDamage: number;
    score: number;
    team: ModelTypes["Team"];
    steamUser?: ModelTypes["SteamUser"];
  };
  ["Team"]: GraphQLTypes["Team"];
  ["Weapon"]: {
    name: string;
    weaponType: ModelTypes["WeaponType"];
  };
  ["WeaponType"]: GraphQLTypes["WeaponType"];
  ["PlayerRoundWeaponStats"]: {
    steamId64: string;
    round: ModelTypes["Round"];
    weapon: ModelTypes["Weapon"];
    totalDamage: number;
    shotsHead: number;
    shotsChest: number;
    shotsLegs: number;
    shotsArms: number;
    shotsFired: number;
    steamUser?: ModelTypes["SteamUser"];
  };
  ["SteamUser"]: {
    steamId64: string;
    name?: string;
    avatarBigUrl?: string;
    avatarMediumUrl?: string;
  };
  ["PaginatedGame"]: {
    content?: ModelTypes["Game"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedGameMode"]: {
    content?: ModelTypes["GameMode"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedPlayerRoundStats"]: {
    content?: ModelTypes["PlayerRoundStats"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedPlayerRoundWeaponStats"]: {
    content?: ModelTypes["PlayerRoundWeaponStats"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedRound"]: {
    content?: ModelTypes["Round"][];
    totalCount: number;
    pageCount: number;
  };
  ["PlayerStatistics"]: {
    steamId64: string;
    rank: number;
    kills: number;
    deaths: number;
    suicides: number;
    killDeathRatio: number;
    totalScore: number;
    totalDamage: number;
    numberGamesPlayed: number;
    numberRoundsPlayed: number;
    avgDamagePerRound: number;
    avgScorePerRound: number;
    steamUser?: ModelTypes["SteamUser"];
  };
  ["PlayerWeaponStatistics"]: {
    steamId64: string;
    totalDamage: number;
    totalShots: number;
    shotsChest: number;
    shotsLegs: number;
    shotsArms: number;
    shotsHead: number;
    weapon: ModelTypes["Weapon"];
    steamUser?: ModelTypes["SteamUser"];
  };
  ["PaginatedPlayerStatistics"]: {
    content?: ModelTypes["PlayerStatistics"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedGameserver"]: {
    content?: ModelTypes["Gameserver"][];
    totalCount: number;
    pageCount: number;
  };
  ["Ban"]: {
    id: string;
    steamId64: string;
    bannedById64?: string;
    createdAt: ModelTypes["DateTime"];
    expiredAt: ModelTypes["DateTime"];
    reason: string;
    gameserver?: ModelTypes["Gameserver"];
    id1?: string;
    id2?: string;
    bannedSteamUser?: ModelTypes["SteamUser"];
    bannedBySteamUser?: ModelTypes["SteamUser"];
  };
  ["RegisteredPlayer"]: {
    steamId64?: string;
    visibleRole?: string;
    rootAdmin?: boolean;
    kick?: boolean;
    ban?: boolean;
    tempKickBan?: boolean;
    mute?: boolean;
    makeTeams?: boolean;
    reservedSlots?: boolean;
    broadcastMessage?: boolean;
    gameControl?: boolean;
    steamUser?: ModelTypes["SteamUser"];
  };
  ["AuthKey"]: {
    id: number;
    authKey: string;
    description: string;
    lastUse: ModelTypes["DateTime"];
  };
  ["PaginatedRegisteredPlayers"]: {
    content?: ModelTypes["RegisteredPlayer"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedBan"]: {
    content?: ModelTypes["Ban"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedGameserverConfig"]: {
    content?: ModelTypes["GameserverConfig"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedMatchConfig"]: {
    content?: ModelTypes["MatchConfig"][];
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedAuthKey"]: {
    content?: ModelTypes["AuthKey"][];
    totalCount: number;
    pageCount: number;
  };
  ["LoginResponse"]: {
    appConfig: ModelTypes["AppConfig"];
    jwt: string;
  };
  ["AppInfo"]: {
    gamesPlayed: number;
    roundsPlayed: number;
    activeBans: number;
    uniquePlayers: number;
  };
  ["Query"]: {
    appConfig: ModelTypes["AppConfig"];
    authKeys: ModelTypes["PaginatedAuthKey"];
    authKey?: ModelTypes["AuthKey"];
    authValid: boolean;
    registeredPlayers: ModelTypes["PaginatedRegisteredPlayers"];
    registeredPlayer?: ModelTypes["RegisteredPlayer"];
    bans: ModelTypes["PaginatedBan"];
    banCheck?: ModelTypes["Ban"];
    gameservers: ModelTypes["PaginatedGameserver"];
    gameserver: ModelTypes["Gameserver"];
    matchConfigs: ModelTypes["PaginatedMatchConfig"];
    matchConfig: ModelTypes["MatchConfig"];
    gameserverConfigs: ModelTypes["PaginatedGameserverConfig"];
    gameserverConfig?: ModelTypes["GameserverConfig"];
    games: ModelTypes["PaginatedGame"];
    game?: ModelTypes["Game"];
    rounds: ModelTypes["PaginatedRound"];
    round?: ModelTypes["Round"];
    gameModes: ModelTypes["PaginatedGameMode"];
    playerRoundStats: ModelTypes["PaginatedPlayerRoundStats"];
    playerRoundWeaponStats: ModelTypes["PaginatedPlayerRoundWeaponStats"];
    playerStatistics: ModelTypes["PaginatedPlayerStatistics"];
    playerWeaponStatistics: ModelTypes["PlayerWeaponStatistics"][];
  };
  ["AuthKeyQuery"]: GraphQLTypes["AuthKeyQuery"];
  ["RegisteredPlayersQuery"]: GraphQLTypes["RegisteredPlayersQuery"];
  ["RegisteredPlayerQuery"]: GraphQLTypes["RegisteredPlayerQuery"];
  ["BanQuery"]: GraphQLTypes["BanQuery"];
  ["BanCheck"]: GraphQLTypes["BanCheck"];
  ["GameserversQuery"]: GraphQLTypes["GameserversQuery"];
  ["GameserverConfigOrder"]: GraphQLTypes["GameserverConfigOrder"];
  ["GameserverConfigFilter"]: GraphQLTypes["GameserverConfigFilter"];
  ["GameserverQuery"]: GraphQLTypes["GameserverQuery"];
  ["MatchConfigsQuery"]: GraphQLTypes["MatchConfigsQuery"];
  ["MatchConfigQuery"]: GraphQLTypes["MatchConfigQuery"];
  ["GameserverConfigsQuery"]: GraphQLTypes["GameserverConfigsQuery"];
  ["GameQuery"]: GraphQLTypes["GameQuery"];
  ["ServerMapInput"]: GraphQLTypes["ServerMapInput"];
  ["GameModeInput"]: GraphQLTypes["GameModeInput"];
  ["RoundQuery"]: GraphQLTypes["RoundQuery"];
  ["PlayerRoundStatsQuery"]: GraphQLTypes["PlayerRoundStatsQuery"];
  ["PlayerRoundWeaponStatsQuery"]: GraphQLTypes["PlayerRoundWeaponStatsQuery"];
  ["PlayerStatisticsQuery"]: GraphQLTypes["PlayerStatisticsQuery"];
  ["OrderPlayerBaseStats"]: GraphQLTypes["OrderPlayerBaseStats"];
  ["PlayerWeaponStatisticsQuery"]: GraphQLTypes["PlayerWeaponStatisticsQuery"];
  ["Mutation"]: {
    updateAppConfig: ModelTypes["AppConfig"];
    deleteAuthKey: boolean;
    /** X-Request-ID must be set in header */
    createUpdateAuthKey: ModelTypes["AuthKey"];
    login: ModelTypes["LoginResponse"];
    loginDev: ModelTypes["LoginResponse"];
    deleteRegisteredPlayer: boolean;
    createUpdateRegisteredPlayer: ModelTypes["RegisteredPlayer"];
    deleteBan: boolean;
    /** X-Request-ID must be set in header */
    createUpdateBan: ModelTypes["Ban"];
    deleteGameserver: boolean;
    /** X-Request-ID must be set in header */
    createUpdateGameserver: ModelTypes["Gameserver"];
    /** Only applies to gameserver key which is set for authorization */
    updateGameserver: ModelTypes["Gameserver"];
    authPlayerToken: string;
    deleteMatchConfig: boolean;
    /** X-Request-ID must be set in header */
    createUpdateMatchConfig: ModelTypes["MatchConfig"];
    deleteGameserverConfig: boolean;
    createUpdateGameserverConfig: ModelTypes["GameserverConfig"];
    /** Used to assign MatchConfig and password to a server from the game by an authed player */
    assignMatchConfig: ModelTypes["GameserverConfig"];
    deleteGames: boolean;
    /** X-Request-ID must be set in header */
    createUpdateGame: ModelTypes["Game"];
    deleteRounds: boolean;
    /** X-Request-ID must be set in header */
    createUpdateRound: ModelTypes["Round"];
    createUpdatePlayerRoundStats: boolean;
    createUpdatePlayerRoundWeaponStats: boolean;
  };
  ["AppConfigInput"]: GraphQLTypes["AppConfigInput"];
  ["AuthKeyInput"]: GraphQLTypes["AuthKeyInput"];
  ["RegisteredPlayerInput"]: GraphQLTypes["RegisteredPlayerInput"];
  ["BanInput"]: GraphQLTypes["BanInput"];
  ["GameserverInput"]: GraphQLTypes["GameserverInput"];
  ["GameserverUpdateInput"]: GraphQLTypes["GameserverUpdateInput"];
  ["MatchConfigInput"]: GraphQLTypes["MatchConfigInput"];
  ["GameserverConfigInput"]: GraphQLTypes["GameserverConfigInput"];
  ["GameInput"]: GraphQLTypes["GameInput"];
  ["RoundInput"]: GraphQLTypes["RoundInput"];
  ["PlayerRoundStatsInput"]: GraphQLTypes["PlayerRoundStatsInput"];
  ["PlayerRoundWeaponStatsInput"]: GraphQLTypes["PlayerRoundWeaponStatsInput"];
  ["WeaponInput"]: GraphQLTypes["WeaponInput"];
};

export type GraphQLTypes = {
  ["GameMode"]: {
    __typename: "GameMode";
    name: string;
    isTeamBased: boolean;
  };
  ["MatchConfig"]: {
    __typename: "MatchConfig";
    id: number;
    configName: string;
    gameMode: GraphQLTypes["GameMode"];
    configHash: string;
    matchEndLength: number;
    warmUpLength: number;
    friendlyFireScale: number;
    mapLength: number;
    roundLength: number;
    preRoundLength: number;
    roundEndLength: number;
    roundLimit: number;
    allowGhostcam: boolean;
    playerVoteThreshold: number;
    autoBalanceTeams: boolean;
    playerVoteTeamOnly: boolean;
    maxTeamDamage: number;
    enablePlayerVote: boolean;
    autoSwapTeams: boolean;
    midGameBreakLength: number;
    nadeRestriction: boolean;
    globalVoicechat: boolean;
    muteDeadToTeam: boolean;
    ranked: boolean;
    private: boolean;
  };
  ["GameserverConfig"]: {
    __typename: "GameserverConfig";
    gameserver: GraphQLTypes["Gameserver"];
    currentMatchConfig?: GraphQLTypes["MatchConfig"];
    currentName: string;
    voteLength: number;
    gamePassword: string;
    reservedSlots: number;
    balanceClans: boolean;
    allowSkipMapVote: boolean;
    tempKickBanTime: number;
    autoRecordReplay: boolean;
    playerGameControl: boolean;
    enableMapVote: boolean;
    serverAdmins: string;
    serverDescription: string;
    website: string;
    contact: string;
    mapNoReplay: number;
    enableVoicechat: boolean;
  };
  ["Gameserver"]: {
    __typename: "Gameserver";
    id: string;
    authKey?: string;
    currentName: string;
    description?: string;
    lastContact?: GraphQLTypes["DateTime"];
    gameserverConfig?: GraphQLTypes["GameserverConfig"];
  };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  ["DateTime"]: any;
  ["ServerMap"]: {
    __typename: "ServerMap";
    name: string;
  };
  ["Game"]: {
    __typename: "Game";
    id: string;
    gameserver: GraphQLTypes["Gameserver"];
    matchConfig?: GraphQLTypes["MatchConfig"];
    startedAt: GraphQLTypes["DateTime"];
    endedAt?: GraphQLTypes["DateTime"];
    map: GraphQLTypes["ServerMap"];
    gameMode: GraphQLTypes["GameMode"];
    rounds: Array<GraphQLTypes["Round"]>;
  };
  ["AppConfig"]: {
    __typename: "AppConfig";
    instanceId?: string;
    publicStats?: boolean;
    banlistPartners?: Array<string>;
    publicBanQuery?: boolean;
    masterserverKey?: string;
    steamWebApiKey?: string;
    ownAddress?: string;
    playerStatsCacheAge?: number;
    minScoreStats?: number;
    appInfo: GraphQLTypes["AppInfo"];
  };
  ["Round"]: {
    __typename: "Round";
    id: number;
    game: GraphQLTypes["Game"];
    startedAt: GraphQLTypes["DateTime"];
    endedAt?: GraphQLTypes["DateTime"];
    scoreSpecialForces: number;
    scoreTerrorists: number;
    playerRoundStats?: Array<GraphQLTypes["PlayerRoundStats"]>;
    playerRoundWeaponStats?: Array<GraphQLTypes["PlayerRoundWeaponStats"]>;
  };
  ["PlayerRoundStats"]: {
    __typename: "PlayerRoundStats";
    round: GraphQLTypes["Round"];
    steamId64: string;
    kills: number;
    deaths: number;
    suicides: number;
    totalDamage: number;
    score: number;
    team: GraphQLTypes["Team"];
    steamUser?: GraphQLTypes["SteamUser"];
  };
  ["Team"]: Team;
  ["Weapon"]: {
    __typename: "Weapon";
    name: string;
    weaponType: GraphQLTypes["WeaponType"];
  };
  ["WeaponType"]: WeaponType;
  ["PlayerRoundWeaponStats"]: {
    __typename: "PlayerRoundWeaponStats";
    steamId64: string;
    round: GraphQLTypes["Round"];
    weapon: GraphQLTypes["Weapon"];
    totalDamage: number;
    shotsHead: number;
    shotsChest: number;
    shotsLegs: number;
    shotsArms: number;
    shotsFired: number;
    steamUser?: GraphQLTypes["SteamUser"];
  };
  ["SteamUser"]: {
    __typename: "SteamUser";
    steamId64: string;
    name?: string;
    avatarBigUrl?: string;
    avatarMediumUrl?: string;
  };
  ["PaginatedGame"]: {
    __typename: "PaginatedGame";
    content?: Array<GraphQLTypes["Game"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedGameMode"]: {
    __typename: "PaginatedGameMode";
    content?: Array<GraphQLTypes["GameMode"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedPlayerRoundStats"]: {
    __typename: "PaginatedPlayerRoundStats";
    content?: Array<GraphQLTypes["PlayerRoundStats"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedPlayerRoundWeaponStats"]: {
    __typename: "PaginatedPlayerRoundWeaponStats";
    content?: Array<GraphQLTypes["PlayerRoundWeaponStats"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedRound"]: {
    __typename: "PaginatedRound";
    content?: Array<GraphQLTypes["Round"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PlayerStatistics"]: {
    __typename: "PlayerStatistics";
    steamId64: string;
    rank: number;
    kills: number;
    deaths: number;
    suicides: number;
    killDeathRatio: number;
    totalScore: number;
    totalDamage: number;
    numberGamesPlayed: number;
    numberRoundsPlayed: number;
    avgDamagePerRound: number;
    avgScorePerRound: number;
    steamUser?: GraphQLTypes["SteamUser"];
  };
  ["PlayerWeaponStatistics"]: {
    __typename: "PlayerWeaponStatistics";
    steamId64: string;
    totalDamage: number;
    totalShots: number;
    shotsChest: number;
    shotsLegs: number;
    shotsArms: number;
    shotsHead: number;
    weapon: GraphQLTypes["Weapon"];
    steamUser?: GraphQLTypes["SteamUser"];
  };
  ["PaginatedPlayerStatistics"]: {
    __typename: "PaginatedPlayerStatistics";
    content?: Array<GraphQLTypes["PlayerStatistics"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedGameserver"]: {
    __typename: "PaginatedGameserver";
    content?: Array<GraphQLTypes["Gameserver"]>;
    totalCount: number;
    pageCount: number;
  };
  ["Ban"]: {
    __typename: "Ban";
    id: string;
    steamId64: string;
    bannedById64?: string;
    createdAt: GraphQLTypes["DateTime"];
    expiredAt: GraphQLTypes["DateTime"];
    reason: string;
    gameserver?: GraphQLTypes["Gameserver"];
    id1?: string;
    id2?: string;
    bannedSteamUser?: GraphQLTypes["SteamUser"];
    bannedBySteamUser?: GraphQLTypes["SteamUser"];
  };
  ["RegisteredPlayer"]: {
    __typename: "RegisteredPlayer";
    steamId64?: string;
    visibleRole?: string;
    rootAdmin?: boolean;
    kick?: boolean;
    ban?: boolean;
    tempKickBan?: boolean;
    mute?: boolean;
    makeTeams?: boolean;
    reservedSlots?: boolean;
    broadcastMessage?: boolean;
    gameControl?: boolean;
    steamUser?: GraphQLTypes["SteamUser"];
  };
  ["AuthKey"]: {
    __typename: "AuthKey";
    id: number;
    authKey: string;
    description: string;
    lastUse: GraphQLTypes["DateTime"];
  };
  ["PaginatedRegisteredPlayers"]: {
    __typename: "PaginatedRegisteredPlayers";
    content?: Array<GraphQLTypes["RegisteredPlayer"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedBan"]: {
    __typename: "PaginatedBan";
    content?: Array<GraphQLTypes["Ban"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedGameserverConfig"]: {
    __typename: "PaginatedGameserverConfig";
    content?: Array<GraphQLTypes["GameserverConfig"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedMatchConfig"]: {
    __typename: "PaginatedMatchConfig";
    content?: Array<GraphQLTypes["MatchConfig"]>;
    totalCount: number;
    pageCount: number;
  };
  ["PaginatedAuthKey"]: {
    __typename: "PaginatedAuthKey";
    content?: Array<GraphQLTypes["AuthKey"]>;
    totalCount: number;
    pageCount: number;
  };
  ["LoginResponse"]: {
    __typename: "LoginResponse";
    appConfig: GraphQLTypes["AppConfig"];
    jwt: string;
  };
  ["AppInfo"]: {
    __typename: "AppInfo";
    gamesPlayed: number;
    roundsPlayed: number;
    activeBans: number;
    uniquePlayers: number;
  };
  ["Query"]: {
    __typename: "Query";
    appConfig: GraphQLTypes["AppConfig"];
    authKeys: GraphQLTypes["PaginatedAuthKey"];
    authKey?: GraphQLTypes["AuthKey"];
    authValid: boolean;
    registeredPlayers: GraphQLTypes["PaginatedRegisteredPlayers"];
    registeredPlayer?: GraphQLTypes["RegisteredPlayer"];
    bans: GraphQLTypes["PaginatedBan"];
    banCheck?: GraphQLTypes["Ban"];
    gameservers: GraphQLTypes["PaginatedGameserver"];
    gameserver: GraphQLTypes["Gameserver"];
    matchConfigs: GraphQLTypes["PaginatedMatchConfig"];
    matchConfig: GraphQLTypes["MatchConfig"];
    gameserverConfigs: GraphQLTypes["PaginatedGameserverConfig"];
    gameserverConfig?: GraphQLTypes["GameserverConfig"];
    games: GraphQLTypes["PaginatedGame"];
    game?: GraphQLTypes["Game"];
    rounds: GraphQLTypes["PaginatedRound"];
    round?: GraphQLTypes["Round"];
    gameModes: GraphQLTypes["PaginatedGameMode"];
    playerRoundStats: GraphQLTypes["PaginatedPlayerRoundStats"];
    playerRoundWeaponStats: GraphQLTypes["PaginatedPlayerRoundWeaponStats"];
    playerStatistics: GraphQLTypes["PaginatedPlayerStatistics"];
    playerWeaponStatistics: Array<GraphQLTypes["PlayerWeaponStatistics"]>;
  };
  ["AuthKeyQuery"]: {
    page?: number;
    pageSize?: number;
    search?: string;
    orderDesc?: boolean;
  };
  ["RegisteredPlayersQuery"]: {
    page?: number;
    pageSize?: number;
    search?: string;
  };
  ["RegisteredPlayerQuery"]: {
    id?: number;
    steamId64?: string;
  };
  ["BanQuery"]: {
    page?: number;
    pageSize?: number;
    search?: string;
    steamId64?: string;
    bannedBySteamId64?: string;
    id1?: string;
    id2?: string;
    orderDesc?: boolean;
    orderByExpirationDate?: boolean;
    noExpiredBans?: boolean;
  };
  ["BanCheck"]: {
    steamId64?: string;
    id1?: string;
    id2?: string;
    banId?: string;
    /** Ignored if request does not include authentification. */
    checkBanlistPartners?: boolean;
  };
  ["GameserversQuery"]: {
    page?: number;
    pageSize?: number;
    orderDesc?: boolean;
    orderBy?: GraphQLTypes["GameserverConfigOrder"];
    search?: string;
    configFilter?: GraphQLTypes["GameserverConfigFilter"];
  };
  ["GameserverConfigOrder"]: GameserverConfigOrder;
  ["GameserverConfigFilter"]: GameserverConfigFilter;
  ["GameserverQuery"]: {
    id?: string;
    authKey?: string;
  };
  ["MatchConfigsQuery"]: {
    page?: number;
    pageSize?: number;
    configName?: string;
    orderDesc?: boolean;
  };
  ["MatchConfigQuery"]: {
    id?: number;
    configName?: number;
  };
  ["GameserverConfigsQuery"]: {
    page?: number;
    pageSize?: number;
    search?: string;
    orderDesc?: boolean;
    orderByGameserverName?: boolean;
  };
  ["GameQuery"]: {
    page?: number;
    pageSize?: number;
    orderDesc?: boolean;
    orderByEndedAt?: boolean;
    gameserverId?: string;
    startedAfter?: GraphQLTypes["DateTime"];
    startedBefore?: GraphQLTypes["DateTime"];
    endedAfter?: GraphQLTypes["DateTime"];
    endedBefore?: GraphQLTypes["DateTime"];
    map?: GraphQLTypes["ServerMapInput"];
    gameMode?: GraphQLTypes["GameModeInput"];
    onlyFinishedGames?: boolean;
    rankedOnly?: boolean;
  };
  ["ServerMapInput"]: {
    name: string;
  };
  ["GameModeInput"]: {
    name: string;
    isTeamBased?: boolean;
  };
  ["RoundQuery"]: {
    page?: number;
    pageSize?: number;
    orderDesc?: boolean;
    gameId?: string;
    startedAfter?: GraphQLTypes["DateTime"];
    startedBefore?: GraphQLTypes["DateTime"];
    onlyFinishedRounds?: boolean;
  };
  ["PlayerRoundStatsQuery"]: {
    page?: number;
    pageSize?: number;
    roundId: number;
  };
  ["PlayerRoundWeaponStatsQuery"]: {
    page?: number;
    pageSize?: number;
    roundId?: number;
  };
  ["PlayerStatisticsQuery"]: {
    steamId64?: string;
    page?: number;
    pageSize?: number;
    orderDesc?: boolean;
    orderBy?: GraphQLTypes["OrderPlayerBaseStats"];
    gameModeName?: string;
    roundId?: number;
    gameId?: string;
    startedAfter?: GraphQLTypes["DateTime"];
    startedBefore?: GraphQLTypes["DateTime"];
    endedAfter?: GraphQLTypes["DateTime"];
    endedBefore?: GraphQLTypes["DateTime"];
    onlyFinishedRounds?: boolean;
    /** Only possible if only using sorts */
    cachedIfPossible?: boolean;
    ranked?: boolean;
  };
  ["OrderPlayerBaseStats"]: OrderPlayerBaseStats;
  ["PlayerWeaponStatisticsQuery"]: {
    steamId64?: string;
    gameModeName?: string;
    roundId?: number;
    gameId?: string;
    startedAfter?: GraphQLTypes["DateTime"];
    startedBefore?: GraphQLTypes["DateTime"];
    endedAfter?: GraphQLTypes["DateTime"];
    endedBefore?: GraphQLTypes["DateTime"];
    onlyFinishedRounds?: boolean;
  };
  ["Mutation"]: {
    __typename: "Mutation";
    updateAppConfig: GraphQLTypes["AppConfig"];
    deleteAuthKey: boolean;
    /** X-Request-ID must be set in header */
    createUpdateAuthKey: GraphQLTypes["AuthKey"];
    login: GraphQLTypes["LoginResponse"];
    loginDev: GraphQLTypes["LoginResponse"];
    deleteRegisteredPlayer: boolean;
    createUpdateRegisteredPlayer: GraphQLTypes["RegisteredPlayer"];
    deleteBan: boolean;
    /** X-Request-ID must be set in header */
    createUpdateBan: GraphQLTypes["Ban"];
    deleteGameserver: boolean;
    /** X-Request-ID must be set in header */
    createUpdateGameserver: GraphQLTypes["Gameserver"];
    /** Only applies to gameserver key which is set for authorization */
    updateGameserver: GraphQLTypes["Gameserver"];
    authPlayerToken: string;
    deleteMatchConfig: boolean;
    /** X-Request-ID must be set in header */
    createUpdateMatchConfig: GraphQLTypes["MatchConfig"];
    deleteGameserverConfig: boolean;
    createUpdateGameserverConfig: GraphQLTypes["GameserverConfig"];
    /** Used to assign MatchConfig and password to a server from the game by an authed player */
    assignMatchConfig: GraphQLTypes["GameserverConfig"];
    deleteGames: boolean;
    /** X-Request-ID must be set in header */
    createUpdateGame: GraphQLTypes["Game"];
    deleteRounds: boolean;
    /** X-Request-ID must be set in header */
    createUpdateRound: GraphQLTypes["Round"];
    createUpdatePlayerRoundStats: boolean;
    createUpdatePlayerRoundWeaponStats: boolean;
  };
  ["AppConfigInput"]: {
    publicStats?: boolean;
    banlistPartners?: Array<string>;
    publicBanQuery?: boolean;
    masterserverKey?: string;
    steamWebApiKey?: string;
    /** How often is the playerStats cache recalculated (in min), 0 to disable */
    playerStatsCacheAge?: number;
    minScoreStats?: number;
    ownAddress?: string;
    password?: string;
  };
  ["AuthKeyInput"]: {
    id?: number;
    authKey?: string;
    description?: string;
  };
  ["RegisteredPlayerInput"]: {
    steamId64: string;
    rootAdmin?: boolean;
    visibleRole?: string;
    kick?: boolean;
    ban?: boolean;
    tempKickBan?: boolean;
    mute?: boolean;
    makeTeams?: boolean;
    reservedSlots?: boolean;
    broadcastMessage?: boolean;
    gameControl?: boolean;
  };
  ["BanInput"]: {
    banId?: string;
    steamId64?: string;
    id1?: string;
    id2?: string;
    bannedById64?: string;
    expiredAt?: GraphQLTypes["DateTime"];
    reason?: string;
    gameserverId?: string;
  };
  ["GameserverInput"]: {
    id?: string;
    authKey?: string;
    currentName?: string;
    description?: string;
  };
  ["GameserverUpdateInput"]: {
    currentName?: string;
  };
  ["MatchConfigInput"]: {
    id?: number;
    configName?: string;
    gameMode?: GraphQLTypes["GameModeInput"];
    matchEndLength?: number;
    warmUpLength?: number;
    mapLength?: number;
    roundLength?: number;
    preRoundLength?: number;
    roundEndLength?: number;
    roundLimit?: number;
    midGameBreakLength?: number;
    friendlyFireScale?: number;
    playerVoteThreshold?: number;
    maxTeamDamage?: number;
    allowGhostcam?: boolean;
    autoBalanceTeams?: boolean;
    playerVoteTeamOnly?: boolean;
    enablePlayerVote?: boolean;
    autoSwapTeams?: boolean;
    nadeRestriction?: boolean;
    globalVoicechat?: boolean;
    muteDeadToTeam?: boolean;
    ranked?: boolean;
    private?: boolean;
  };
  ["GameserverConfigInput"]: {
    gameserverId: string;
    currentMatchConfigId?: number;
    currentGameserverName?: string;
    voteLength?: number;
    tempKickBanTime?: number;
    gamePassword?: string;
    serverAdmins?: string;
    serverDescription?: string;
    website?: string;
    contact?: string;
    reservedSlots?: number;
    mapNoReplay?: number;
    balanceClans?: boolean;
    allowSkipMapVote?: boolean;
    autoRecordReplay?: boolean;
    playerGameControl?: boolean;
    enableMapVote?: boolean;
    enableVoicechat?: boolean;
  };
  ["GameInput"]: {
    id?: string;
    gameserverId?: string;
    matchConfigId?: number;
    startedAt?: GraphQLTypes["DateTime"];
    endedAt?: GraphQLTypes["DateTime"];
    map?: GraphQLTypes["ServerMapInput"];
    gameMode?: GraphQLTypes["GameModeInput"];
  };
  ["RoundInput"]: {
    id?: number;
    gameId?: string;
    startedAt?: GraphQLTypes["DateTime"];
    endedAt?: GraphQLTypes["DateTime"];
    scoreSpecialForces?: number;
    scoreTerrorists?: number;
  };
  ["PlayerRoundStatsInput"]: {
    roundId: number;
    steamId64: string;
    kills: number;
    deaths: number;
    suicides: number;
    totalDamage: number;
    score: number;
    team: GraphQLTypes["Team"];
  };
  ["PlayerRoundWeaponStatsInput"]: {
    roundId: number;
    steamId64: string;
    weapon: GraphQLTypes["WeaponInput"];
    totalDamage: number;
    shotsHead: number;
    shotsChest: number;
    shotsLegs: number;
    shotsArms: number;
    shotsFired: number;
  };
  ["WeaponInput"]: {
    name: string;
    weaponType: GraphQLTypes["WeaponType"];
  };
};
export const enum Team {
  NONE = "NONE",
  SF = "SF",
  TERR = "TERR",
}
export const enum WeaponType {
  NONE = "NONE",
  KNIFE = "KNIFE",
  PISTOL = "PISTOL",
  SMG = "SMG",
  RIFLE = "RIFLE",
  NADE = "NADE",
  BOMB = "BOMB",
}
export const enum GameserverConfigOrder {
  currentName = "currentName",
  lastContact = "lastContact",
  hasConfig = "hasConfig",
}
export const enum GameserverConfigFilter {
  none = "none",
  withConfig = "withConfig",
  withoutConfig = "withoutConfig",
}
export const enum OrderPlayerBaseStats {
  sumKills = "sumKills",
  sumDeaths = "sumDeaths",
  sumSuicides = "sumSuicides",
  sumDamage = "sumDamage",
  killDeath = "killDeath",
  averageScorePerRound = "averageScorePerRound",
  averageDamagePerRound = "averageDamagePerRound",
  sumScore = "sumScore",
  roundsPlayed = "roundsPlayed",
  gamesPlayed = "gamesPlayed",
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super("");
    console.error(response);
  }
  toString() {
    return "GraphQL Response Error";
  }
}

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<
  UnwrapPromise<ReturnType<T>>
>;
export type ZeusHook<
  T extends (
    ...args: any[]
  ) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>
> = ZeusState<ReturnType<T>[N]>;

type WithTypeNameValue<T> = T & {
  __typename?: true;
};
type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
type IsArray<T, U> = T extends Array<infer R>
  ? InputType<R, U>[]
  : InputType<T, U>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;

type IsInterfaced<SRC extends DeepAnify<DST>, DST> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends "__union" & infer R
        ? P extends keyof DST
          ? IsArray<
              R,
              "__typename" extends keyof DST
                ? DST[P] & { __typename: true }
                : DST[P]
            >
          : {}
        : never;
    }[keyof DST] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends "__union" & infer R ? never : P;
          }[keyof DST]
        >,
        "__typename"
      >]: IsPayLoad<DST[P]> extends true ? SRC[P] : IsArray<SRC[P], DST[P]>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends true
        ? SRC[P]
        : IsArray<SRC[P], DST[P]>;
    };

export type MapType<SRC, DST> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST>
  : never;
export type InputType<SRC, DST> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P]>;
    } & MapType<SRC, Omit<IsPayLoad<DST>, "__alias">>
  : MapType<SRC, IsPayLoad<DST>>;
type Func<P extends any[], R> = (...args: P) => R;
type AnyFunc = Func<any, any>;
export type ArgsType<F extends AnyFunc> = F extends Func<infer P, any>
  ? P
  : never;
export type OperationOptions = {
  variables?: Record<string, any>;
  operationName?: string;
};
export type OperationToGraphQL<V, T> = <Z extends V>(
  o: Z | V,
  options?: OperationOptions
) => Promise<InputType<T, Z>>;
export type SubscriptionToGraphQL<V, T> = <Z extends V>(
  o: Z | V,
  options?: OperationOptions
) => {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z>) => void) => void;
  off: (
    fn: (e: {
      data?: InputType<T, Z>;
      code?: number;
      reason?: string;
      message?: string;
    }) => void
  ) => void;
  error: (
    fn: (e: { data?: InputType<T, Z>; errors?: string[] }) => void
  ) => void;
  open: () => void;
};
export type SelectionFunction<V> = <T>(t: T | V) => T;
export type fetchOptions = ArgsType<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (
  ...args: infer R
) => WebSocket
  ? R
  : never;
export type chainOptions =
  | [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }]
  | [fetchOptions[0]];
export type FetchFunction = (
  query: string,
  variables?: Record<string, any>
) => Promise<any>;
export type SubscriptionFunction = (query: string) => void;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<
  F extends [infer ARGS, any] ? ARGS : undefined
>;

export const ZeusSelect = <T>() => ((t: any) => t) as SelectionFunction<T>;

export const ScalarResolver = (scalar: string, value: any) => {
  switch (scalar) {
    case "String":
      return `${JSON.stringify(value)}`;
    case "Int":
      return `${value}`;
    case "Float":
      return `${value}`;
    case "Boolean":
      return `${value}`;
    case "ID":
      return `"${value}"`;
    case "enum":
      return `${value}`;
    case "scalar":
      return `${value}`;
    default:
      return false;
  }
};

export const TypesPropsResolver = ({
  value,
  type,
  name,
  key,
  blockArrays,
}: {
  value: any;
  type: string;
  name: string;
  key?: string;
  blockArrays?: boolean;
}): string => {
  if (value === null) {
    return `null`;
  }
  let resolvedValue = AllTypesProps[type][name];
  if (key) {
    resolvedValue = resolvedValue[key];
  }
  if (!resolvedValue) {
    throw new Error(`Cannot resolve ${type} ${name}${key ? ` ${key}` : ""}`);
  }
  const typeResolved = resolvedValue.type;
  const isArray = resolvedValue.array;
  const isArrayRequired = resolvedValue.arrayRequired;
  if (typeof value === "string" && value.startsWith(`ZEUS_VAR$`)) {
    const isRequired = resolvedValue.required ? "!" : "";
    let t = `${typeResolved}`;
    if (isArray) {
      if (isRequired) {
        t = `${t}!`;
      }
      t = `[${t}]`;
      if (isArrayRequired) {
        t = `${t}!`;
      }
    } else {
      if (isRequired) {
        t = `${t}!`;
      }
    }
    return `\$${value.split(`ZEUS_VAR$`)[1]}__ZEUS_VAR__${t}`;
  }
  if (isArray && !blockArrays) {
    return `[${value
      .map((v: any) =>
        TypesPropsResolver({ value: v, type, name, key, blockArrays: true })
      )
      .join(",")}]`;
  }
  const reslovedScalar = ScalarResolver(typeResolved, value);
  if (!reslovedScalar) {
    const resolvedType = AllTypesProps[typeResolved];
    if (typeof resolvedType === "object") {
      const argsKeys = Object.keys(resolvedType);
      return `{${argsKeys
        .filter((ak) => value[ak] !== undefined)
        .map(
          (ak) =>
            `${ak}:${TypesPropsResolver({
              value: value[ak],
              type: typeResolved,
              name: ak,
            })}`
        )}}`;
    }
    return ScalarResolver(AllTypesProps[typeResolved], value) as string;
  }
  return reslovedScalar;
};

const isArrayFunction = (parent: string[], a: any[]) => {
  const [values, r] = a;
  const [mainKey, key, ...keys] = parent;
  const keyValues = Object.keys(values).filter(
    (k) => typeof values[k] !== "undefined"
  );

  if (!keys.length) {
    return keyValues.length > 0
      ? `(${keyValues
          .map(
            (v) =>
              `${v}:${TypesPropsResolver({
                value: values[v],
                type: mainKey,
                name: key,
                key: v,
              })}`
          )
          .join(",")})${r ? traverseToSeekArrays(parent, r) : ""}`
      : traverseToSeekArrays(parent, r);
  }

  const [typeResolverKey] = keys.splice(keys.length - 1, 1);
  let valueToResolve = ReturnTypes[mainKey][key];
  for (const k of keys) {
    valueToResolve = ReturnTypes[valueToResolve][k];
  }

  const argumentString =
    keyValues.length > 0
      ? `(${keyValues
          .map(
            (v) =>
              `${v}:${TypesPropsResolver({
                value: values[v],
                type: valueToResolve,
                name: typeResolverKey,
                key: v,
              })}`
          )
          .join(",")})${r ? traverseToSeekArrays(parent, r) : ""}`
      : traverseToSeekArrays(parent, r);
  return argumentString;
};

const resolveKV = (
  k: string,
  v: boolean | string | { [x: string]: boolean | string }
) =>
  typeof v === "boolean"
    ? k
    : typeof v === "object"
    ? `${k}{${objectToTree(v)}}`
    : `${k}${v}`;

const objectToTree = (o: { [x: string]: boolean | string }): string =>
  `{${Object.keys(o)
    .map((k) => `${resolveKV(k, o[k])}`)
    .join(" ")}}`;

const traverseToSeekArrays = (parent: string[], a?: any): string => {
  if (!a) return "";
  if (Object.keys(a).length === 0) {
    return "";
  }
  let b: Record<string, any> = {};
  if (Array.isArray(a)) {
    return isArrayFunction([...parent], a);
  } else {
    if (typeof a === "object") {
      Object.keys(a)
        .filter((k) => typeof a[k] !== "undefined")
        .forEach((k) => {
          if (k === "__alias") {
            Object.keys(a[k]).forEach((aliasKey) => {
              const aliasOperations = a[k][aliasKey];
              const aliasOperationName = Object.keys(aliasOperations)[0];
              const aliasOperation = aliasOperations[aliasOperationName];
              b[
                `${aliasOperationName}__alias__${aliasKey}: ${aliasOperationName}`
              ] = traverseToSeekArrays(
                [...parent, aliasOperationName],
                aliasOperation
              );
            });
          } else {
            b[k] = traverseToSeekArrays([...parent, k], a[k]);
          }
        });
    } else {
      return "";
    }
  }
  return objectToTree(b);
};

const buildQuery = (type: string, a?: Record<any, any>) =>
  traverseToSeekArrays([type], a);

const inspectVariables = (query: string) => {
  const regex = /\$\b\w*__ZEUS_VAR__\[?[^!^\]^\s^,^\)^\}]*[!]?[\]]?[!]?/g;
  let result;
  const AllVariables: string[] = [];
  while ((result = regex.exec(query))) {
    if (AllVariables.includes(result[0])) {
      continue;
    }
    AllVariables.push(result[0]);
  }
  if (!AllVariables.length) {
    return query;
  }
  let filteredQuery = query;
  AllVariables.forEach((variable) => {
    while (filteredQuery.includes(variable)) {
      filteredQuery = filteredQuery.replace(
        variable,
        variable.split("__ZEUS_VAR__")[0]
      );
    }
  });
  return `(${AllVariables.map((a) => a.split("__ZEUS_VAR__"))
    .map(([variableName, variableType]) => `${variableName}:${variableType}`)
    .join(", ")})${filteredQuery}`;
};

export const queryConstruct =
  (
    t: "query" | "mutation" | "subscription",
    tName: string,
    operationName?: string
  ) =>
  (o: Record<any, any>) =>
    `${t.toLowerCase()}${
      operationName ? " " + operationName : ""
    }${inspectVariables(buildQuery(tName, o))}`;

const fullChainConstruct =
  (fn: FetchFunction) =>
  (t: "query" | "mutation" | "subscription", tName: string) =>
  (o: Record<any, any>, options?: OperationOptions) =>
    fn(
      queryConstruct(t, tName, options?.operationName)(o),
      options?.variables
    ).then((r: any) => {
      seekForAliases(r);
      return r;
    });

export const fullChainConstructor = <
  F extends FetchFunction,
  R extends keyof ValueTypes
>(
  fn: F,
  operation: "query" | "mutation" | "subscription",
  key: R
) =>
  ((o, options) =>
    fullChainConstruct(fn)(operation, key)(
      o as any,
      options
    )) as OperationToGraphQL<ValueTypes[R], GraphQLTypes[R]>;

const fullSubscriptionConstruct =
  (fn: SubscriptionFunction) =>
  (t: "query" | "mutation" | "subscription", tName: string) =>
  (o: Record<any, any>, options?: OperationOptions) =>
    fn(queryConstruct(t, tName, options?.operationName)(o));

export const fullSubscriptionConstructor = <
  F extends SubscriptionFunction,
  R extends keyof ValueTypes
>(
  fn: F,
  operation: "query" | "mutation" | "subscription",
  key: R
) =>
  ((o, options) =>
    fullSubscriptionConstruct(fn)(operation, key)(
      o as any,
      options
    )) as SubscriptionToGraphQL<ValueTypes[R], GraphQLTypes[R]>;

const seekForAliases = (response: any) => {
  const traverseAlias = (value: any) => {
    if (Array.isArray(value)) {
      value.forEach(seekForAliases);
    } else {
      if (typeof value === "object") {
        seekForAliases(value);
      }
    }
  };
  if (typeof response === "object" && response) {
    const keys = Object.keys(response);
    if (keys.length < 1) {
      return;
    }
    keys.forEach((k) => {
      const value = response[k];
      if (k.indexOf("__alias__") !== -1) {
        const [operation, alias] = k.split("__alias__");
        response[alias] = {
          [operation]: value,
        };
        delete response[k];
      }
      traverseAlias(value);
    });
  }
};

export const $ = (t: TemplateStringsArray): any => `ZEUS_VAR$${t.join("")}`;

export const resolverFor = <
  T extends keyof ValueTypes,
  Z extends keyof ValueTypes[T],
  Y extends (
    args: Required<ValueTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any
  ) => Z extends keyof ModelTypes[T]
    ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]>
    : any
>(
  type: T,
  field: Z,
  fn: Y
) => fn as (args?: any, source?: any) => any;

const handleFetchResponse = (
  response: Parameters<
    Extract<Parameters<ReturnType<typeof fetch>["then"]>[0], Function>
  >[0]
): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json();
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, any> = {}) => {
    let fetchFunction = fetch;
    let queryString = query;
    let fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === "GET") {
      queryString = encodeURIComponent(query);
      return fetchFunction(`${options[0]}?query=${queryString}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetchFunction(`${options[0]}`, {
      body: JSON.stringify({ query: queryString, variables }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + "?query=" + encodeURIComponent(query);
    const wsString = queryString.replace("http", "ws");
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            if (data) {
              seekForAliases(data);
            }
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error("No websockets implemented");
  }
};

export const Thunder = (
  fn: FetchFunction,
  subscriptionFn: SubscriptionFunction
) => ({
  query: fullChainConstructor(fn, "query", "Query"),
  mutation: fullChainConstructor(fn, "mutation", "Mutation"),
});

export const Chain = (...options: chainOptions) => ({
  query: fullChainConstructor(apiFetch(options), "query", "Query"),
  mutation: fullChainConstructor(apiFetch(options), "mutation", "Mutation"),
});
export const Zeus = {
  query: (o: ValueTypes["Query"], operationName?: string) =>
    queryConstruct("query", "Query", operationName)(o),
  mutation: (o: ValueTypes["Mutation"], operationName?: string) =>
    queryConstruct("mutation", "Mutation", operationName)(o),
};
export const Selectors = {
  query: ZeusSelect<ValueTypes["Query"]>(),
  mutation: ZeusSelect<ValueTypes["Mutation"]>(),
};

export const Gql = Chain("http://localhost:3000/graphql");
