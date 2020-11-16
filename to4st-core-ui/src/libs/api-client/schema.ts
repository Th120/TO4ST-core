import { Observable } from 'graphql-typed-client'

export interface Query {
  games: PaginatedGame
  game: Game | null
  rounds: PaginatedRound
  round: Round | null
  gameModes: PaginatedGameMode
  playerRoundStats: PaginatedPlayerRoundStats
  playerRoundWeaponStats: PaginatedPlayerRoundWeaponStats
  playerStatistics: PaginatedPlayerStatistics
  playerWeaponStatistics: PlayerWeaponStatistics[]
  gameservers: PaginatedGameserver
  gameserver: Gameserver
  registeredPlayers: PaginatedRegisteredPlayers
  registeredPlayer: RegisteredPlayer | null
  bans: PaginatedBan
  banCheck: Ban | null
  gameserverConfigs: PaginatedGameserverConfig
  gameserverConfig: GameserverConfig
  matchConfigs: PaginatedMatchConfig
  matchConfig: MatchConfig
  authKeys: PaginatedAuthKey
  authKey: AuthKey | null
  authValid: Boolean
  appConfig: AppConfig
  __typename: 'Query'
}

/** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
export type Int = number

/** The `Boolean` scalar type represents `true` or `false`. */
export type Boolean = boolean

/** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
export type String = string

/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
export type DateTime = any

export interface PaginatedGame {
  content: Game[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedGame'
}

export interface Game {
  id: String
  gameserver: Gameserver
  matchConfig: MatchConfig
  startedAt: DateTime
  endedAt: DateTime | null
  map: ServerMap
  gameMode: GameMode
  rounds: Round[]
  __typename: 'Game'
}

export interface Gameserver {
  id: String
  authKey: String | null
  currentName: String
  description: String | null
  lastContact: DateTime | null
  gameserverConfig: GameserverConfig | null
  __typename: 'Gameserver'
}

export interface GameserverConfig {
  gameserver: Gameserver
  currentMatchConfig: MatchConfig | null
  currentName: String
  voteLength: Int
  gamePassword: String
  reservedSlots: Int
  balanceClans: Boolean
  allowSkipMapVote: Boolean
  tempKickBanTime: Int
  autoRecordReplay: Boolean
  playerGameControl: Boolean
  enableMapVote: Boolean
  serverAdmins: String
  serverDescription: String
  website: String
  contact: String
  mapNoReplay: Int
  enableVoicechat: Boolean
  __typename: 'GameserverConfig'
}

export interface MatchConfig {
  id: Int
  configName: String
  gameMode: GameMode
  configHash: String
  matchEndLength: Int
  warmUpLength: Int
  friendlyFireScale: Float
  mapLength: Int
  roundLength: Int
  preRoundLength: Int
  roundEndLength: Int
  roundLimit: Int
  allowGhostcam: Boolean
  playerVoteThreshold: Float
  autoBalanceTeams: Boolean
  playerVoteTeamOnly: Boolean
  maxTeamDamage: Float
  enablePlayerVote: Boolean
  autoSwapTeams: Boolean
  midGameBreakLength: Int
  nadeRestriction: Boolean
  globalVoicechat: Boolean
  muteDeadToTeam: Boolean
  ranked: Boolean
  private: Boolean
  __typename: 'MatchConfig'
}

export interface GameMode {
  name: String
  isTeamBased: Boolean
  __typename: 'GameMode'
}

/** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
export type Float = number

export interface ServerMap {
  name: String
  __typename: 'ServerMap'
}

export interface Round {
  id: Int
  game: Game
  startedAt: DateTime
  endedAt: DateTime | null
  scoreSpecialForces: Int
  scoreTerrorists: Int
  __typename: 'Round'
}

export interface PaginatedRound {
  content: Round[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedRound'
}

export interface PaginatedGameMode {
  content: GameMode[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedGameMode'
}

export interface PaginatedPlayerRoundStats {
  content: PlayerRoundStats[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedPlayerRoundStats'
}

export interface PlayerRoundStats {
  round: Round
  steamId64: Int
  kills: Int
  deaths: Int
  suicides: Int
  totalDamage: Float
  score: Int
  team: Team
  steamUser: SteamUser | null
  __typename: 'PlayerRoundStats'
}

export enum Team {
  NONE = 'NONE',
  SF = 'SF',
  TERR = 'TERR',
}

export interface SteamUser {
  steamId64: String
  name: String | null
  avatarBigUrl: String
  avatarMediumUrl: String
  __typename: 'SteamUser'
}

export interface PaginatedPlayerRoundWeaponStats {
  content: PlayerRoundWeaponStats[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedPlayerRoundWeaponStats'
}

export interface PlayerRoundWeaponStats {
  steamId64: String
  round: Round
  weapon: Weapon
  totalDamage: Float
  shotsHead: Int
  shotsChest: Int
  shotsLegs: Int
  shotsArms: Int
  shotsFired: Int
  steamUser: SteamUser | null
  __typename: 'PlayerRoundWeaponStats'
}

export interface Weapon {
  name: String
  weaponType: WeaponType
  __typename: 'Weapon'
}

export enum WeaponType {
  NONE = 'NONE',
  KNIFE = 'KNIFE',
  PISTOL = 'PISTOL',
  SMG = 'SMG',
  RIFLE = 'RIFLE',
  NADE = 'NADE',
  BOMB = 'BOMB',
}

export enum OrderPlayerBaseStats {
  sumKills = 'sumKills',
  sumDeaths = 'sumDeaths',
  sumSuicides = 'sumSuicides',
  sumDamage = 'sumDamage',
  killDeath = 'killDeath',
  averageScorePerRound = 'averageScorePerRound',
  averageDamagePerRound = 'averageDamagePerRound',
  sumScore = 'sumScore',
  roundsPlayed = 'roundsPlayed',
  gamesPlayed = 'gamesPlayed',
}

export interface PaginatedPlayerStatistics {
  content: PlayerStatistics[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedPlayerStatistics'
}

export interface PlayerStatistics {
  steamId64: String
  rank: Int
  kills: Int
  deaths: Int
  suicides: Int
  killDeathRatio: Float
  totalScore: Int
  totalDamage: Float
  numberGamesPlayed: Int
  numberRoundsPlayed: Int
  avgDamagePerRound: Float
  avgScorePerRound: Float
  steamUser: SteamUser | null
  __typename: 'PlayerStatistics'
}

export interface PlayerWeaponStatistics {
  steamId64: String
  totalDamage: Float
  totalShots: Int
  shotsChest: Int
  shotsLegs: Int
  shotsArms: Int
  shotsHead: Int
  weapon: Weapon
  steamUser: SteamUser | null
  __typename: 'PlayerWeaponStatistics'
}

export enum GameserverConfigOrder {
  currentName = 'currentName',
  lastContact = 'lastContact',
  hasConfig = 'hasConfig',
}

export enum GameserverConfigFilter {
  none = 'none',
  withConfig = 'withConfig',
  withoutConfig = 'withoutConfig',
}

export interface PaginatedGameserver {
  content: Gameserver[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedGameserver'
}

export interface PaginatedRegisteredPlayers {
  content: RegisteredPlayer[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedRegisteredPlayers'
}

export interface RegisteredPlayer {
  steamId64: String | null
  visibleRole: String | null
  rootAdmin: Boolean | null
  kick: Boolean | null
  ban: Boolean | null
  tempKickBan: Boolean | null
  mute: Boolean | null
  makeTeams: Boolean | null
  reservedSlots: Boolean | null
  broadcastMessage: Boolean | null
  gameControl: Boolean | null
  steamUser: SteamUser | null
  __typename: 'RegisteredPlayer'
}

export interface PaginatedBan {
  content: Ban[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedBan'
}

export interface Ban {
  id: String
  steamId64: String
  bannedById64: String | null
  createdAt: DateTime
  expiredAt: DateTime
  reason: String
  gameserver: Gameserver | null
  id1: String | null
  id2: String | null
  bannedSteamUser: SteamUser | null
  bannedBySteamUser: SteamUser | null
  __typename: 'Ban'
}

export interface PaginatedGameserverConfig {
  content: GameserverConfig[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedGameserverConfig'
}

export interface PaginatedMatchConfig {
  content: MatchConfig[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedMatchConfig'
}

export interface PaginatedAuthKey {
  content: AuthKey[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedAuthKey'
}

export interface AuthKey {
  id: Int
  authKey: String
  description: String
  lastUse: DateTime
  __typename: 'AuthKey'
}

export interface AppConfig {
  instanceId: String | null
  publicStats: Boolean | null
  banlistPartners: String[] | null
  publicBanQuery: Boolean | null
  masterserverKey: String | null
  steamWebApiKey: String | null
  ownAddress: String | null
  appInfo: AppInfo
  __typename: 'AppConfig'
}

export interface AppInfo {
  gamesPlayed: Int
  roundsPlayed: Int
  activeBans: Int
  uniquePlayers: Int
  __typename: 'AppInfo'
}

export interface Mutation {
  deleteGames: Boolean
  /** X-Request-ID must be set in header */
  createUpdateGame: Game
  deleteRounds: Boolean
  /** X-Request-ID must be set in header */
  createUpdateRound: Round
  createUpdatePlayerRoundStats: Boolean
  createUpdatePlayerRoundWeaponStats: Boolean
  deleteGameserver: Boolean
  /** X-Request-ID must be set in header */
  createUpdateGameserver: Gameserver
  /** Only applies to gameserver key which is set for authorization */
  updateGameserver: Gameserver
  deleteRegisteredPlayer: Boolean
  createUpdateRegisteredPlayer: RegisteredPlayer
  deleteBan: Boolean
  /** X-Request-ID must be set in header */
  createUpdateBan: Ban
  authPlayerToken: String
  deleteGameserverConfig: Boolean
  createUpdateGameserverConfig: GameserverConfig
  /** Used to assign MatchConfig and password to a server from the game by an authed player */
  assignMatchConfig: GameserverConfig
  deleteMatchConfig: Boolean
  /** X-Request-ID must be set in header */
  createUpdateMatchConfig: MatchConfig
  deleteAuthKey: Boolean
  /** X-Request-ID must be set in header */
  createUpdateAuthKey: AuthKey
  login: LoginResponse
  loginDev: LoginResponse
  updateAppConfig: AppConfig
  __typename: 'Mutation'
}

export interface LoginResponse {
  appConfig: AppConfig
  jwt: String
  __typename: 'LoginResponse'
}

export interface QueryRequest {
  games?: [{ options: GameQuery }, PaginatedGameRequest]
  game?: [{ gameId: String }, GameRequest]
  rounds?: [{ options: RoundQuery }, PaginatedRoundRequest]
  round?: [{ roundId: Float }, RoundRequest]
  gameModes?: PaginatedGameModeRequest
  playerRoundStats?: [{ options: PlayerRoundStatsQuery }, PaginatedPlayerRoundStatsRequest]
  playerRoundWeaponStats?: [{ options: PlayerRoundWeaponStatsQuery }, PaginatedPlayerRoundWeaponStatsRequest]
  playerStatistics?: [{ options: PlayerStatisticsQuery }, PaginatedPlayerStatisticsRequest]
  playerWeaponStatistics?: [{ options: PlayerWeaponStatisticsQuery }, PlayerWeaponStatisticsRequest]
  gameservers?: [{ options: GameserversQuery }, PaginatedGameserverRequest]
  gameserver?: [{ options: GameserverQuery }, GameserverRequest]
  registeredPlayers?: [{ options: RegisteredPlayersQuery }, PaginatedRegisteredPlayersRequest]
  registeredPlayer?: [{ options: RegisteredPlayerQuery }, RegisteredPlayerRequest]
  bans?: [{ options: BanQuery }, PaginatedBanRequest]
  banCheck?: [{ banCheck: BanCheck }, BanRequest]
  gameserverConfigs?: [{ options: GameserverConfigsQuery }, PaginatedGameserverConfigRequest]
  gameserverConfig?: [{ options: GameserverConfigQuery }, GameserverConfigRequest]
  matchConfigs?: [{ options: MatchConfigsQuery }, PaginatedMatchConfigRequest]
  matchConfig?: [{ options: MatchConfigQuery }, MatchConfigRequest]
  authKeys?: [{ options: AuthKeyQuery }, PaginatedAuthKeyRequest]
  authKey?: [{ authKey: String }, AuthKeyRequest]
  authValid?: boolean | number
  appConfig?: [{ cached?: Boolean | null }, AppConfigRequest] | AppConfigRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameQuery {
  page?: Int | null
  pageSize?: Int | null
  orderDesc?: Boolean | null
  gameserverId?: String | null
  startedAfter?: DateTime | null
  startedBefore?: DateTime | null
  map?: ServerMapInput | null
  gameMode?: GameModeInput | null
  onlyFinishedGames?: Boolean | null
}

export interface ServerMapInput {
  name: String
}

export interface GameModeInput {
  name: String
  isTeamBased?: Boolean | null
}

export interface PaginatedGameRequest {
  content?: GameRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameRequest {
  id?: boolean | number
  gameserver?: GameserverRequest
  matchConfig?: MatchConfigRequest
  startedAt?: boolean | number
  endedAt?: boolean | number
  map?: ServerMapRequest
  gameMode?: GameModeRequest
  rounds?: RoundRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameserverRequest {
  id?: boolean | number
  authKey?: boolean | number
  currentName?: boolean | number
  description?: boolean | number
  lastContact?: boolean | number
  gameserverConfig?: GameserverConfigRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameserverConfigRequest {
  gameserver?: GameserverRequest
  currentMatchConfig?: MatchConfigRequest
  currentName?: boolean | number
  voteLength?: boolean | number
  gamePassword?: boolean | number
  reservedSlots?: boolean | number
  balanceClans?: boolean | number
  allowSkipMapVote?: boolean | number
  tempKickBanTime?: boolean | number
  autoRecordReplay?: boolean | number
  playerGameControl?: boolean | number
  enableMapVote?: boolean | number
  serverAdmins?: boolean | number
  serverDescription?: boolean | number
  website?: boolean | number
  contact?: boolean | number
  mapNoReplay?: boolean | number
  enableVoicechat?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface MatchConfigRequest {
  id?: boolean | number
  configName?: boolean | number
  gameMode?: GameModeRequest
  configHash?: boolean | number
  matchEndLength?: boolean | number
  warmUpLength?: boolean | number
  friendlyFireScale?: boolean | number
  mapLength?: boolean | number
  roundLength?: boolean | number
  preRoundLength?: boolean | number
  roundEndLength?: boolean | number
  roundLimit?: boolean | number
  allowGhostcam?: boolean | number
  playerVoteThreshold?: boolean | number
  autoBalanceTeams?: boolean | number
  playerVoteTeamOnly?: boolean | number
  maxTeamDamage?: boolean | number
  enablePlayerVote?: boolean | number
  autoSwapTeams?: boolean | number
  midGameBreakLength?: boolean | number
  nadeRestriction?: boolean | number
  globalVoicechat?: boolean | number
  muteDeadToTeam?: boolean | number
  ranked?: boolean | number
  private?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameModeRequest {
  name?: boolean | number
  isTeamBased?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface ServerMapRequest {
  name?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface RoundRequest {
  id?: boolean | number
  game?: GameRequest
  startedAt?: boolean | number
  endedAt?: boolean | number
  scoreSpecialForces?: boolean | number
  scoreTerrorists?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface RoundQuery {
  page?: Int | null
  pageSize?: Int | null
  orderDesc?: Boolean | null
  gameId?: String | null
  startedAfter?: DateTime | null
  startedBefore?: DateTime | null
  onlyFinishedRounds?: Boolean | null
}

export interface PaginatedRoundRequest {
  content?: RoundRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface PaginatedGameModeRequest {
  content?: GameModeRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface PlayerRoundStatsQuery {
  page?: Int | null
  pageSize?: Int | null
  roundId: Int
}

export interface PaginatedPlayerRoundStatsRequest {
  content?: PlayerRoundStatsRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface PlayerRoundStatsRequest {
  round?: RoundRequest
  steamId64?: boolean | number
  kills?: boolean | number
  deaths?: boolean | number
  suicides?: boolean | number
  totalDamage?: boolean | number
  score?: boolean | number
  team?: boolean | number
  steamUser?: SteamUserRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface SteamUserRequest {
  steamId64?: boolean | number
  name?: boolean | number
  avatarBigUrl?: boolean | number
  avatarMediumUrl?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface PlayerRoundWeaponStatsQuery {
  page?: Int | null
  pageSize?: Int | null
  roundId?: Int | null
}

export interface PaginatedPlayerRoundWeaponStatsRequest {
  content?: PlayerRoundWeaponStatsRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface PlayerRoundWeaponStatsRequest {
  steamId64?: boolean | number
  round?: RoundRequest
  weapon?: WeaponRequest
  totalDamage?: boolean | number
  shotsHead?: boolean | number
  shotsChest?: boolean | number
  shotsLegs?: boolean | number
  shotsArms?: boolean | number
  shotsFired?: boolean | number
  steamUser?: SteamUserRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface WeaponRequest {
  name?: boolean | number
  weaponType?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface PlayerStatisticsQuery {
  steamId64?: String | null
  page?: Int | null
  pageSize?: Int | null
  orderDesc?: Boolean | null
  orderBy?: OrderPlayerBaseStats | null
  gameModeName?: String | null
  roundId?: Int | null
  gameId?: String | null
  startedAfter?: DateTime | null
  startedBefore?: DateTime | null
  endedAfter?: DateTime | null
  endedBefore?: DateTime | null
  onlyFinishedRounds?: Boolean | null
}

export interface PaginatedPlayerStatisticsRequest {
  content?: PlayerStatisticsRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface PlayerStatisticsRequest {
  steamId64?: boolean | number
  rank?: boolean | number
  kills?: boolean | number
  deaths?: boolean | number
  suicides?: boolean | number
  killDeathRatio?: boolean | number
  totalScore?: boolean | number
  totalDamage?: boolean | number
  numberGamesPlayed?: boolean | number
  numberRoundsPlayed?: boolean | number
  avgDamagePerRound?: boolean | number
  avgScorePerRound?: boolean | number
  steamUser?: SteamUserRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface PlayerWeaponStatisticsQuery {
  steamId64?: String | null
  gameModeName?: String | null
  roundId?: Int | null
  gameId?: String | null
  startedAfter?: DateTime | null
  startedBefore?: DateTime | null
  endedAfter?: DateTime | null
  endedBefore?: DateTime | null
  onlyFinishedRounds?: Boolean | null
}

export interface PlayerWeaponStatisticsRequest {
  steamId64?: boolean | number
  totalDamage?: boolean | number
  totalShots?: boolean | number
  shotsChest?: boolean | number
  shotsLegs?: boolean | number
  shotsArms?: boolean | number
  shotsHead?: boolean | number
  weapon?: WeaponRequest
  steamUser?: SteamUserRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameserversQuery {
  page?: Int | null
  pageSize?: Int | null
  orderDesc?: Boolean | null
  orderBy?: GameserverConfigOrder | null
  search?: String | null
  configFilter?: GameserverConfigFilter | null
}

export interface PaginatedGameserverRequest {
  content?: GameserverRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameserverQuery {
  id?: String | null
  authKey?: String | null
}

export interface RegisteredPlayersQuery {
  page?: Int | null
  pageSize?: Int | null
  search?: String | null
}

export interface PaginatedRegisteredPlayersRequest {
  content?: RegisteredPlayerRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface RegisteredPlayerRequest {
  steamId64?: boolean | number
  visibleRole?: boolean | number
  rootAdmin?: boolean | number
  kick?: boolean | number
  ban?: boolean | number
  tempKickBan?: boolean | number
  mute?: boolean | number
  makeTeams?: boolean | number
  reservedSlots?: boolean | number
  broadcastMessage?: boolean | number
  gameControl?: boolean | number
  steamUser?: SteamUserRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface RegisteredPlayerQuery {
  id?: Int | null
  steamId64?: String | null
}

export interface BanQuery {
  page?: Int | null
  pageSize?: Int | null
  search?: String | null
  steamId64?: String | null
  bannedBySteamId64?: String | null
  id1?: String | null
  id2?: String | null
  orderDesc?: Boolean | null
  orderByExpirationDate?: Boolean | null
  noExpiredBans?: Boolean | null
}

export interface PaginatedBanRequest {
  content?: BanRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface BanRequest {
  id?: boolean | number
  steamId64?: boolean | number
  bannedById64?: boolean | number
  createdAt?: boolean | number
  expiredAt?: boolean | number
  reason?: boolean | number
  gameserver?: GameserverRequest
  id1?: boolean | number
  id2?: boolean | number
  bannedSteamUser?: SteamUserRequest
  bannedBySteamUser?: SteamUserRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface BanCheck {
  steamId64?: String | null
  id1?: String | null
  id2?: String | null
  banId?: String | null
  /** Ignored if request does not include authentification. */
  checkBanlistPartners?: Boolean | null
}

export interface GameserverConfigsQuery {
  page?: Int | null
  pageSize?: Int | null
  search?: String | null
  orderDesc?: Boolean | null
  orderByGameserverName?: Boolean | null
}

export interface PaginatedGameserverConfigRequest {
  content?: GameserverConfigRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameserverConfigQuery {
  id?: String | null
  authKey?: String | null
}

export interface MatchConfigsQuery {
  page?: Int | null
  pageSize?: Int | null
  configName?: String | null
  orderDesc?: Boolean | null
}

export interface PaginatedMatchConfigRequest {
  content?: MatchConfigRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface MatchConfigQuery {
  id?: Int | null
  configName?: Int | null
}

export interface AuthKeyQuery {
  page?: Int | null
  pageSize?: Int | null
  search?: String | null
  orderDesc?: Boolean | null
}

export interface PaginatedAuthKeyRequest {
  content?: AuthKeyRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface AuthKeyRequest {
  id?: boolean | number
  authKey?: boolean | number
  description?: boolean | number
  lastUse?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface AppConfigRequest {
  instanceId?: boolean | number
  publicStats?: boolean | number
  banlistPartners?: boolean | number
  publicBanQuery?: boolean | number
  masterserverKey?: boolean | number
  steamWebApiKey?: boolean | number
  ownAddress?: boolean | number
  appInfo?: AppInfoRequest
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface AppInfoRequest {
  gamesPlayed?: boolean | number
  roundsPlayed?: boolean | number
  activeBans?: boolean | number
  uniquePlayers?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface MutationRequest {
  deleteGames?: [{ gameInputs: GameInput[] }]
  /** X-Request-ID must be set in header */
  createUpdateGame?: [{ gameInput: GameInput }, GameRequest]
  deleteRounds?: [{ roundInputs: RoundInput[] }]
  /** X-Request-ID must be set in header */
  createUpdateRound?: [{ roundInput: RoundInput }, RoundRequest]
  createUpdatePlayerRoundStats?: [{ playerRoundStatsInput: PlayerRoundStatsInput[] }]
  createUpdatePlayerRoundWeaponStats?: [{ playerRoundWeaponStatsInput: PlayerRoundWeaponStatsInput[] }]
  deleteGameserver?: [{ gameserverId: String }]
  /** X-Request-ID must be set in header */
  createUpdateGameserver?: [{ gameserver: GameserverInput }, GameserverRequest]
  /** Only applies to gameserver key which is set for authorization */
  updateGameserver?: [{ gameserverUpdate: GameserverUpdateInput }, GameserverRequest]
  deleteRegisteredPlayer?: [{ steamId64: String }]
  createUpdateRegisteredPlayer?: [{ registeredPlayer: RegisteredPlayerInput }, RegisteredPlayerRequest]
  deleteBan?: [{ banId: String }]
  /** X-Request-ID must be set in header */
  createUpdateBan?: [{ banInput: BanInput }, BanRequest]
  authPlayerToken?: [{ steamId64: String }]
  deleteGameserverConfig?: [{ gameserverId: String }]
  createUpdateGameserverConfig?: [{ gameserverConfig: GameserverConfigInput }, GameserverConfigRequest]
  /** Used to assign MatchConfig and password to a server from the game by an authed player */
  assignMatchConfig?: [{ gameserverConfig: GameserverConfigInput }, GameserverConfigRequest]
  deleteMatchConfig?: [{ options: MatchConfigQuery }]
  /** X-Request-ID must be set in header */
  createUpdateMatchConfig?: [{ matchConfig: MatchConfigInput }, MatchConfigRequest]
  deleteAuthKey?: [{ authKey: String }]
  /** X-Request-ID must be set in header */
  createUpdateAuthKey?: [{ authKey: AuthKeyInput }, AuthKeyRequest]
  login?: [{ password: String }, LoginResponseRequest]
  loginDev?: [{ password: String }, LoginResponseRequest]
  updateAppConfig?: [{ appConfig: AppConfigInput }, AppConfigRequest]
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GameInput {
  id?: String | null
  gameserverId?: String | null
  startedAt?: DateTime | null
  endedAt?: DateTime | null
  map?: ServerMapInput | null
  gameMode?: GameModeInput | null
}

export interface RoundInput {
  id?: Int | null
  gameId?: String | null
  startedAt?: DateTime | null
  endedAt?: DateTime | null
  scoreSpecialForces?: Int | null
  scoreTerrorists?: Int | null
}

export interface PlayerRoundStatsInput {
  roundId: Int
  steamId64: String
  kills: Int
  deaths: Int
  suicides: Int
  totalDamage: Float
  score: Int
  team: Team
}

export interface PlayerRoundWeaponStatsInput {
  roundId: Int
  steamId64: String
  weapon: WeaponInput
  totalDamage: Float
  shotsHead: Int
  shotsChest: Int
  shotsLegs: Int
  shotsArms: Int
  shotsFired: Int
}

export interface WeaponInput {
  name: String
  weaponType: WeaponType
}

export interface GameserverInput {
  id?: String | null
  authKey?: String | null
  currentName?: String | null
  description?: String | null
}

export interface GameserverUpdateInput {
  currentName?: String | null
}

export interface RegisteredPlayerInput {
  steamId64: String
  rootAdmin?: Boolean | null
  visibleRole?: String | null
  kick?: Boolean | null
  ban?: Boolean | null
  tempKickBan?: Boolean | null
  mute?: Boolean | null
  makeTeams?: Boolean | null
  reservedSlots?: Boolean | null
  broadcastMessage?: Boolean | null
  gameControl?: Boolean | null
}

export interface BanInput {
  banId?: String | null
  steamId64?: String | null
  id1?: String | null
  id2?: String | null
  bannedById64?: String | null
  expiredAt?: DateTime | null
  reason?: String | null
  gameserverId?: String | null
}

export interface GameserverConfigInput {
  gameserverId: String
  currentMatchConfigId?: Int | null
  currentGameserverName?: String | null
  voteLength?: Int | null
  tempKickBanTime?: Int | null
  gamePassword?: String | null
  serverAdmins?: String | null
  serverDescription?: String | null
  website?: String | null
  contact?: String | null
  reservedSlots?: Int | null
  mapNoReplay?: Int | null
  balanceClans?: Boolean | null
  allowSkipMapVote?: Boolean | null
  autoRecordReplay?: Boolean | null
  playerGameControl?: Boolean | null
  enableMapVote?: Boolean | null
  enableVoicechat?: Boolean | null
}

export interface MatchConfigInput {
  id?: Int | null
  configName?: String | null
  gameMode?: GameModeInput | null
  matchEndLength?: Int | null
  warmUpLength?: Int | null
  mapLength?: Int | null
  roundLength?: Int | null
  preRoundLength?: Int | null
  roundEndLength?: Int | null
  roundLimit?: Int | null
  midGameBreakLength?: Int | null
  friendlyFireScale?: Float | null
  playerVoteThreshold?: Float | null
  maxTeamDamage?: Int | null
  allowGhostcam?: Boolean | null
  autoBalanceTeams?: Boolean | null
  playerVoteTeamOnly?: Boolean | null
  enablePlayerVote?: Boolean | null
  autoSwapTeams?: Boolean | null
  nadeRestriction?: Boolean | null
  globalVoicechat?: Boolean | null
  muteDeadToTeam?: Boolean | null
  ranked?: Boolean | null
  private?: Boolean | null
}

export interface AuthKeyInput {
  id?: Int | null
  authKey?: String | null
  description?: String | null
}

export interface LoginResponseRequest {
  appConfig?: AppConfigRequest
  jwt?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface AppConfigInput {
  publicStats?: Boolean | null
  banlistPartners?: String[] | null
  publicBanQuery?: Boolean | null
  masterserverKey?: String | null
  steamWebApiKey?: String | null
  ownAddress?: String | null
  password?: String | null
}

const Query_possibleTypes = ['Query']
export const isQuery = (obj: { __typename: String }): obj is Query => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Query_possibleTypes.includes(obj.__typename)
}

const PaginatedGame_possibleTypes = ['PaginatedGame']
export const isPaginatedGame = (obj: { __typename: String }): obj is PaginatedGame => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedGame_possibleTypes.includes(obj.__typename)
}

const Game_possibleTypes = ['Game']
export const isGame = (obj: { __typename: String }): obj is Game => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Game_possibleTypes.includes(obj.__typename)
}

const Gameserver_possibleTypes = ['Gameserver']
export const isGameserver = (obj: { __typename: String }): obj is Gameserver => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Gameserver_possibleTypes.includes(obj.__typename)
}

const GameserverConfig_possibleTypes = ['GameserverConfig']
export const isGameserverConfig = (obj: { __typename: String }): obj is GameserverConfig => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return GameserverConfig_possibleTypes.includes(obj.__typename)
}

const MatchConfig_possibleTypes = ['MatchConfig']
export const isMatchConfig = (obj: { __typename: String }): obj is MatchConfig => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return MatchConfig_possibleTypes.includes(obj.__typename)
}

const GameMode_possibleTypes = ['GameMode']
export const isGameMode = (obj: { __typename: String }): obj is GameMode => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return GameMode_possibleTypes.includes(obj.__typename)
}

const ServerMap_possibleTypes = ['ServerMap']
export const isServerMap = (obj: { __typename: String }): obj is ServerMap => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return ServerMap_possibleTypes.includes(obj.__typename)
}

const Round_possibleTypes = ['Round']
export const isRound = (obj: { __typename: String }): obj is Round => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Round_possibleTypes.includes(obj.__typename)
}

const PaginatedRound_possibleTypes = ['PaginatedRound']
export const isPaginatedRound = (obj: { __typename: String }): obj is PaginatedRound => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedRound_possibleTypes.includes(obj.__typename)
}

const PaginatedGameMode_possibleTypes = ['PaginatedGameMode']
export const isPaginatedGameMode = (obj: { __typename: String }): obj is PaginatedGameMode => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedGameMode_possibleTypes.includes(obj.__typename)
}

const PaginatedPlayerRoundStats_possibleTypes = ['PaginatedPlayerRoundStats']
export const isPaginatedPlayerRoundStats = (obj: { __typename: String }): obj is PaginatedPlayerRoundStats => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedPlayerRoundStats_possibleTypes.includes(obj.__typename)
}

const PlayerRoundStats_possibleTypes = ['PlayerRoundStats']
export const isPlayerRoundStats = (obj: { __typename: String }): obj is PlayerRoundStats => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PlayerRoundStats_possibleTypes.includes(obj.__typename)
}

const SteamUser_possibleTypes = ['SteamUser']
export const isSteamUser = (obj: { __typename: String }): obj is SteamUser => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return SteamUser_possibleTypes.includes(obj.__typename)
}

const PaginatedPlayerRoundWeaponStats_possibleTypes = ['PaginatedPlayerRoundWeaponStats']
export const isPaginatedPlayerRoundWeaponStats = (obj: { __typename: String }): obj is PaginatedPlayerRoundWeaponStats => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedPlayerRoundWeaponStats_possibleTypes.includes(obj.__typename)
}

const PlayerRoundWeaponStats_possibleTypes = ['PlayerRoundWeaponStats']
export const isPlayerRoundWeaponStats = (obj: { __typename: String }): obj is PlayerRoundWeaponStats => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PlayerRoundWeaponStats_possibleTypes.includes(obj.__typename)
}

const Weapon_possibleTypes = ['Weapon']
export const isWeapon = (obj: { __typename: String }): obj is Weapon => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Weapon_possibleTypes.includes(obj.__typename)
}

const PaginatedPlayerStatistics_possibleTypes = ['PaginatedPlayerStatistics']
export const isPaginatedPlayerStatistics = (obj: { __typename: String }): obj is PaginatedPlayerStatistics => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedPlayerStatistics_possibleTypes.includes(obj.__typename)
}

const PlayerStatistics_possibleTypes = ['PlayerStatistics']
export const isPlayerStatistics = (obj: { __typename: String }): obj is PlayerStatistics => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PlayerStatistics_possibleTypes.includes(obj.__typename)
}

const PlayerWeaponStatistics_possibleTypes = ['PlayerWeaponStatistics']
export const isPlayerWeaponStatistics = (obj: { __typename: String }): obj is PlayerWeaponStatistics => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PlayerWeaponStatistics_possibleTypes.includes(obj.__typename)
}

const PaginatedGameserver_possibleTypes = ['PaginatedGameserver']
export const isPaginatedGameserver = (obj: { __typename: String }): obj is PaginatedGameserver => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedGameserver_possibleTypes.includes(obj.__typename)
}

const PaginatedRegisteredPlayers_possibleTypes = ['PaginatedRegisteredPlayers']
export const isPaginatedRegisteredPlayers = (obj: { __typename: String }): obj is PaginatedRegisteredPlayers => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedRegisteredPlayers_possibleTypes.includes(obj.__typename)
}

const RegisteredPlayer_possibleTypes = ['RegisteredPlayer']
export const isRegisteredPlayer = (obj: { __typename: String }): obj is RegisteredPlayer => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return RegisteredPlayer_possibleTypes.includes(obj.__typename)
}

const PaginatedBan_possibleTypes = ['PaginatedBan']
export const isPaginatedBan = (obj: { __typename: String }): obj is PaginatedBan => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedBan_possibleTypes.includes(obj.__typename)
}

const Ban_possibleTypes = ['Ban']
export const isBan = (obj: { __typename: String }): obj is Ban => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Ban_possibleTypes.includes(obj.__typename)
}

const PaginatedGameserverConfig_possibleTypes = ['PaginatedGameserverConfig']
export const isPaginatedGameserverConfig = (obj: { __typename: String }): obj is PaginatedGameserverConfig => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedGameserverConfig_possibleTypes.includes(obj.__typename)
}

const PaginatedMatchConfig_possibleTypes = ['PaginatedMatchConfig']
export const isPaginatedMatchConfig = (obj: { __typename: String }): obj is PaginatedMatchConfig => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedMatchConfig_possibleTypes.includes(obj.__typename)
}

const PaginatedAuthKey_possibleTypes = ['PaginatedAuthKey']
export const isPaginatedAuthKey = (obj: { __typename: String }): obj is PaginatedAuthKey => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedAuthKey_possibleTypes.includes(obj.__typename)
}

const AuthKey_possibleTypes = ['AuthKey']
export const isAuthKey = (obj: { __typename: String }): obj is AuthKey => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return AuthKey_possibleTypes.includes(obj.__typename)
}

const AppConfig_possibleTypes = ['AppConfig']
export const isAppConfig = (obj: { __typename: String }): obj is AppConfig => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return AppConfig_possibleTypes.includes(obj.__typename)
}

const AppInfo_possibleTypes = ['AppInfo']
export const isAppInfo = (obj: { __typename: String }): obj is AppInfo => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return AppInfo_possibleTypes.includes(obj.__typename)
}

const Mutation_possibleTypes = ['Mutation']
export const isMutation = (obj: { __typename: String }): obj is Mutation => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Mutation_possibleTypes.includes(obj.__typename)
}

const LoginResponse_possibleTypes = ['LoginResponse']
export const isLoginResponse = (obj: { __typename: String }): obj is LoginResponse => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return LoginResponse_possibleTypes.includes(obj.__typename)
}

export interface QueryPromiseChain {
  games: (args: {
    options: GameQuery
  }) => PaginatedGamePromiseChain & {
    execute: (request: PaginatedGameRequest, defaultValue?: PaginatedGame) => Promise<PaginatedGame>
  }
  game: (args: {
    gameId: String
  }) => GamePromiseChain & { execute: (request: GameRequest, defaultValue?: Game | null) => Promise<Game | null> }
  rounds: (args: {
    options: RoundQuery
  }) => PaginatedRoundPromiseChain & {
    execute: (request: PaginatedRoundRequest, defaultValue?: PaginatedRound) => Promise<PaginatedRound>
  }
  round: (args: {
    roundId: Float
  }) => RoundPromiseChain & { execute: (request: RoundRequest, defaultValue?: Round | null) => Promise<Round | null> }
  gameModes: PaginatedGameModePromiseChain & {
    execute: (request: PaginatedGameModeRequest, defaultValue?: PaginatedGameMode) => Promise<PaginatedGameMode>
  }
  playerRoundStats: (args: {
    options: PlayerRoundStatsQuery
  }) => PaginatedPlayerRoundStatsPromiseChain & {
    execute: (
      request: PaginatedPlayerRoundStatsRequest,
      defaultValue?: PaginatedPlayerRoundStats,
    ) => Promise<PaginatedPlayerRoundStats>
  }
  playerRoundWeaponStats: (args: {
    options: PlayerRoundWeaponStatsQuery
  }) => PaginatedPlayerRoundWeaponStatsPromiseChain & {
    execute: (
      request: PaginatedPlayerRoundWeaponStatsRequest,
      defaultValue?: PaginatedPlayerRoundWeaponStats,
    ) => Promise<PaginatedPlayerRoundWeaponStats>
  }
  playerStatistics: (args: {
    options: PlayerStatisticsQuery
  }) => PaginatedPlayerStatisticsPromiseChain & {
    execute: (
      request: PaginatedPlayerStatisticsRequest,
      defaultValue?: PaginatedPlayerStatistics,
    ) => Promise<PaginatedPlayerStatistics>
  }
  playerWeaponStatistics: (args: {
    options: PlayerWeaponStatisticsQuery
  }) => {
    execute: (
      request: PlayerWeaponStatisticsRequest,
      defaultValue?: PlayerWeaponStatistics[],
    ) => Promise<PlayerWeaponStatistics[]>
  }
  gameservers: (args: {
    options: GameserversQuery
  }) => PaginatedGameserverPromiseChain & {
    execute: (request: PaginatedGameserverRequest, defaultValue?: PaginatedGameserver) => Promise<PaginatedGameserver>
  }
  gameserver: (args: {
    options: GameserverQuery
  }) => GameserverPromiseChain & { execute: (request: GameserverRequest, defaultValue?: Gameserver) => Promise<Gameserver> }
  registeredPlayers: (args: {
    options: RegisteredPlayersQuery
  }) => PaginatedRegisteredPlayersPromiseChain & {
    execute: (
      request: PaginatedRegisteredPlayersRequest,
      defaultValue?: PaginatedRegisteredPlayers,
    ) => Promise<PaginatedRegisteredPlayers>
  }
  registeredPlayer: (args: {
    options: RegisteredPlayerQuery
  }) => RegisteredPlayerPromiseChain & {
    execute: (request: RegisteredPlayerRequest, defaultValue?: RegisteredPlayer | null) => Promise<RegisteredPlayer | null>
  }
  bans: (args: {
    options: BanQuery
  }) => PaginatedBanPromiseChain & {
    execute: (request: PaginatedBanRequest, defaultValue?: PaginatedBan) => Promise<PaginatedBan>
  }
  banCheck: (args: {
    banCheck: BanCheck
  }) => BanPromiseChain & { execute: (request: BanRequest, defaultValue?: Ban | null) => Promise<Ban | null> }
  gameserverConfigs: (args: {
    options: GameserverConfigsQuery
  }) => PaginatedGameserverConfigPromiseChain & {
    execute: (
      request: PaginatedGameserverConfigRequest,
      defaultValue?: PaginatedGameserverConfig,
    ) => Promise<PaginatedGameserverConfig>
  }
  gameserverConfig: (args: {
    options: GameserverConfigQuery
  }) => GameserverConfigPromiseChain & {
    execute: (request: GameserverConfigRequest, defaultValue?: GameserverConfig) => Promise<GameserverConfig>
  }
  matchConfigs: (args: {
    options: MatchConfigsQuery
  }) => PaginatedMatchConfigPromiseChain & {
    execute: (request: PaginatedMatchConfigRequest, defaultValue?: PaginatedMatchConfig) => Promise<PaginatedMatchConfig>
  }
  matchConfig: (args: {
    options: MatchConfigQuery
  }) => MatchConfigPromiseChain & {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig) => Promise<MatchConfig>
  }
  authKeys: (args: {
    options: AuthKeyQuery
  }) => PaginatedAuthKeyPromiseChain & {
    execute: (request: PaginatedAuthKeyRequest, defaultValue?: PaginatedAuthKey) => Promise<PaginatedAuthKey>
  }
  authKey: (args: {
    authKey: String
  }) => AuthKeyPromiseChain & {
    execute: (request: AuthKeyRequest, defaultValue?: AuthKey | null) => Promise<AuthKey | null>
  }
  authValid: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  appConfig: ((args?: {
    cached?: Boolean | null
  }) => AppConfigPromiseChain & { execute: (request: AppConfigRequest, defaultValue?: AppConfig) => Promise<AppConfig> }) &
    (AppConfigPromiseChain & { execute: (request: AppConfigRequest, defaultValue?: AppConfig) => Promise<AppConfig> })
}

export interface QueryObservableChain {
  games: (args: {
    options: GameQuery
  }) => PaginatedGameObservableChain & {
    execute: (request: PaginatedGameRequest, defaultValue?: PaginatedGame) => Observable<PaginatedGame>
  }
  game: (args: {
    gameId: String
  }) => GameObservableChain & { execute: (request: GameRequest, defaultValue?: Game | null) => Observable<Game | null> }
  rounds: (args: {
    options: RoundQuery
  }) => PaginatedRoundObservableChain & {
    execute: (request: PaginatedRoundRequest, defaultValue?: PaginatedRound) => Observable<PaginatedRound>
  }
  round: (args: {
    roundId: Float
  }) => RoundObservableChain & { execute: (request: RoundRequest, defaultValue?: Round | null) => Observable<Round | null> }
  gameModes: PaginatedGameModeObservableChain & {
    execute: (request: PaginatedGameModeRequest, defaultValue?: PaginatedGameMode) => Observable<PaginatedGameMode>
  }
  playerRoundStats: (args: {
    options: PlayerRoundStatsQuery
  }) => PaginatedPlayerRoundStatsObservableChain & {
    execute: (
      request: PaginatedPlayerRoundStatsRequest,
      defaultValue?: PaginatedPlayerRoundStats,
    ) => Observable<PaginatedPlayerRoundStats>
  }
  playerRoundWeaponStats: (args: {
    options: PlayerRoundWeaponStatsQuery
  }) => PaginatedPlayerRoundWeaponStatsObservableChain & {
    execute: (
      request: PaginatedPlayerRoundWeaponStatsRequest,
      defaultValue?: PaginatedPlayerRoundWeaponStats,
    ) => Observable<PaginatedPlayerRoundWeaponStats>
  }
  playerStatistics: (args: {
    options: PlayerStatisticsQuery
  }) => PaginatedPlayerStatisticsObservableChain & {
    execute: (
      request: PaginatedPlayerStatisticsRequest,
      defaultValue?: PaginatedPlayerStatistics,
    ) => Observable<PaginatedPlayerStatistics>
  }
  playerWeaponStatistics: (args: {
    options: PlayerWeaponStatisticsQuery
  }) => {
    execute: (
      request: PlayerWeaponStatisticsRequest,
      defaultValue?: PlayerWeaponStatistics[],
    ) => Observable<PlayerWeaponStatistics[]>
  }
  gameservers: (args: {
    options: GameserversQuery
  }) => PaginatedGameserverObservableChain & {
    execute: (request: PaginatedGameserverRequest, defaultValue?: PaginatedGameserver) => Observable<PaginatedGameserver>
  }
  gameserver: (args: {
    options: GameserverQuery
  }) => GameserverObservableChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver) => Observable<Gameserver>
  }
  registeredPlayers: (args: {
    options: RegisteredPlayersQuery
  }) => PaginatedRegisteredPlayersObservableChain & {
    execute: (
      request: PaginatedRegisteredPlayersRequest,
      defaultValue?: PaginatedRegisteredPlayers,
    ) => Observable<PaginatedRegisteredPlayers>
  }
  registeredPlayer: (args: {
    options: RegisteredPlayerQuery
  }) => RegisteredPlayerObservableChain & {
    execute: (
      request: RegisteredPlayerRequest,
      defaultValue?: RegisteredPlayer | null,
    ) => Observable<RegisteredPlayer | null>
  }
  bans: (args: {
    options: BanQuery
  }) => PaginatedBanObservableChain & {
    execute: (request: PaginatedBanRequest, defaultValue?: PaginatedBan) => Observable<PaginatedBan>
  }
  banCheck: (args: {
    banCheck: BanCheck
  }) => BanObservableChain & { execute: (request: BanRequest, defaultValue?: Ban | null) => Observable<Ban | null> }
  gameserverConfigs: (args: {
    options: GameserverConfigsQuery
  }) => PaginatedGameserverConfigObservableChain & {
    execute: (
      request: PaginatedGameserverConfigRequest,
      defaultValue?: PaginatedGameserverConfig,
    ) => Observable<PaginatedGameserverConfig>
  }
  gameserverConfig: (args: {
    options: GameserverConfigQuery
  }) => GameserverConfigObservableChain & {
    execute: (request: GameserverConfigRequest, defaultValue?: GameserverConfig) => Observable<GameserverConfig>
  }
  matchConfigs: (args: {
    options: MatchConfigsQuery
  }) => PaginatedMatchConfigObservableChain & {
    execute: (request: PaginatedMatchConfigRequest, defaultValue?: PaginatedMatchConfig) => Observable<PaginatedMatchConfig>
  }
  matchConfig: (args: {
    options: MatchConfigQuery
  }) => MatchConfigObservableChain & {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig) => Observable<MatchConfig>
  }
  authKeys: (args: {
    options: AuthKeyQuery
  }) => PaginatedAuthKeyObservableChain & {
    execute: (request: PaginatedAuthKeyRequest, defaultValue?: PaginatedAuthKey) => Observable<PaginatedAuthKey>
  }
  authKey: (args: {
    authKey: String
  }) => AuthKeyObservableChain & {
    execute: (request: AuthKeyRequest, defaultValue?: AuthKey | null) => Observable<AuthKey | null>
  }
  authValid: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  appConfig: ((args?: {
    cached?: Boolean | null
  }) => AppConfigObservableChain & {
    execute: (request: AppConfigRequest, defaultValue?: AppConfig) => Observable<AppConfig>
  }) &
    (AppConfigObservableChain & { execute: (request: AppConfigRequest, defaultValue?: AppConfig) => Observable<AppConfig> })
}

export interface PaginatedGamePromiseChain {
  content: { execute: (request: GameRequest, defaultValue?: Game[] | null) => Promise<Game[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedGameObservableChain {
  content: { execute: (request: GameRequest, defaultValue?: Game[] | null) => Observable<Game[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface GamePromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  gameserver: GameserverPromiseChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver) => Promise<Gameserver>
  }
  matchConfig: MatchConfigPromiseChain & {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig) => Promise<MatchConfig>
  }
  startedAt: { execute: (request?: boolean | number, defaultValue?: DateTime) => Promise<DateTime> }
  endedAt: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Promise<DateTime | null> }
  map: ServerMapPromiseChain & { execute: (request: ServerMapRequest, defaultValue?: ServerMap) => Promise<ServerMap> }
  gameMode: GameModePromiseChain & { execute: (request: GameModeRequest, defaultValue?: GameMode) => Promise<GameMode> }
  rounds: { execute: (request: RoundRequest, defaultValue?: Round[]) => Promise<Round[]> }
}

export interface GameObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  gameserver: GameserverObservableChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver) => Observable<Gameserver>
  }
  matchConfig: MatchConfigObservableChain & {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig) => Observable<MatchConfig>
  }
  startedAt: { execute: (request?: boolean | number, defaultValue?: DateTime) => Observable<DateTime> }
  endedAt: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Observable<DateTime | null> }
  map: ServerMapObservableChain & { execute: (request: ServerMapRequest, defaultValue?: ServerMap) => Observable<ServerMap> }
  gameMode: GameModeObservableChain & {
    execute: (request: GameModeRequest, defaultValue?: GameMode) => Observable<GameMode>
  }
  rounds: { execute: (request: RoundRequest, defaultValue?: Round[]) => Observable<Round[]> }
}

export interface GameserverPromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  authKey: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  currentName: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  description: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  lastContact: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Promise<DateTime | null> }
  gameserverConfig: GameserverConfigPromiseChain & {
    execute: (request: GameserverConfigRequest, defaultValue?: GameserverConfig | null) => Promise<GameserverConfig | null>
  }
}

export interface GameserverObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  authKey: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  currentName: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  description: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  lastContact: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Observable<DateTime | null> }
  gameserverConfig: GameserverConfigObservableChain & {
    execute: (
      request: GameserverConfigRequest,
      defaultValue?: GameserverConfig | null,
    ) => Observable<GameserverConfig | null>
  }
}

export interface GameserverConfigPromiseChain {
  gameserver: GameserverPromiseChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver) => Promise<Gameserver>
  }
  currentMatchConfig: MatchConfigPromiseChain & {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig | null) => Promise<MatchConfig | null>
  }
  currentName: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  voteLength: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  gamePassword: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  reservedSlots: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  balanceClans: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  allowSkipMapVote: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  tempKickBanTime: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  autoRecordReplay: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  playerGameControl: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  enableMapVote: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  serverAdmins: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  serverDescription: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  website: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  contact: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  mapNoReplay: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  enableVoicechat: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
}

export interface GameserverConfigObservableChain {
  gameserver: GameserverObservableChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver) => Observable<Gameserver>
  }
  currentMatchConfig: MatchConfigObservableChain & {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig | null) => Observable<MatchConfig | null>
  }
  currentName: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  voteLength: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  gamePassword: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  reservedSlots: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  balanceClans: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  allowSkipMapVote: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  tempKickBanTime: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  autoRecordReplay: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  playerGameControl: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  enableMapVote: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  serverAdmins: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  serverDescription: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  website: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  contact: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  mapNoReplay: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  enableVoicechat: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
}

export interface MatchConfigPromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  configName: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  gameMode: GameModePromiseChain & { execute: (request: GameModeRequest, defaultValue?: GameMode) => Promise<GameMode> }
  configHash: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  matchEndLength: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  warmUpLength: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  friendlyFireScale: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  mapLength: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  roundLength: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  preRoundLength: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  roundEndLength: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  roundLimit: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  allowGhostcam: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  playerVoteThreshold: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  autoBalanceTeams: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  playerVoteTeamOnly: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  maxTeamDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  enablePlayerVote: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  autoSwapTeams: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  midGameBreakLength: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  nadeRestriction: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  globalVoicechat: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  muteDeadToTeam: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  ranked: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  private: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
}

export interface MatchConfigObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  configName: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  gameMode: GameModeObservableChain & {
    execute: (request: GameModeRequest, defaultValue?: GameMode) => Observable<GameMode>
  }
  configHash: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  matchEndLength: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  warmUpLength: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  friendlyFireScale: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  mapLength: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  roundLength: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  preRoundLength: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  roundEndLength: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  roundLimit: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  allowGhostcam: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  playerVoteThreshold: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  autoBalanceTeams: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  playerVoteTeamOnly: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  maxTeamDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  enablePlayerVote: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  autoSwapTeams: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  midGameBreakLength: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  nadeRestriction: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  globalVoicechat: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  muteDeadToTeam: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  ranked: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  private: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
}

export interface GameModePromiseChain {
  name: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  isTeamBased: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
}

export interface GameModeObservableChain {
  name: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  isTeamBased: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
}

export interface ServerMapPromiseChain {
  name: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
}

export interface ServerMapObservableChain {
  name: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
}

export interface RoundPromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  game: GamePromiseChain & { execute: (request: GameRequest, defaultValue?: Game) => Promise<Game> }
  startedAt: { execute: (request?: boolean | number, defaultValue?: DateTime) => Promise<DateTime> }
  endedAt: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Promise<DateTime | null> }
  scoreSpecialForces: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  scoreTerrorists: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface RoundObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  game: GameObservableChain & { execute: (request: GameRequest, defaultValue?: Game) => Observable<Game> }
  startedAt: { execute: (request?: boolean | number, defaultValue?: DateTime) => Observable<DateTime> }
  endedAt: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Observable<DateTime | null> }
  scoreSpecialForces: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  scoreTerrorists: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PaginatedRoundPromiseChain {
  content: { execute: (request: RoundRequest, defaultValue?: Round[] | null) => Promise<Round[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedRoundObservableChain {
  content: { execute: (request: RoundRequest, defaultValue?: Round[] | null) => Observable<Round[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PaginatedGameModePromiseChain {
  content: { execute: (request: GameModeRequest, defaultValue?: GameMode[] | null) => Promise<GameMode[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedGameModeObservableChain {
  content: { execute: (request: GameModeRequest, defaultValue?: GameMode[] | null) => Observable<GameMode[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PaginatedPlayerRoundStatsPromiseChain {
  content: {
    execute: (
      request: PlayerRoundStatsRequest,
      defaultValue?: PlayerRoundStats[] | null,
    ) => Promise<PlayerRoundStats[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedPlayerRoundStatsObservableChain {
  content: {
    execute: (
      request: PlayerRoundStatsRequest,
      defaultValue?: PlayerRoundStats[] | null,
    ) => Observable<PlayerRoundStats[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PlayerRoundStatsPromiseChain {
  round: RoundPromiseChain & { execute: (request: RoundRequest, defaultValue?: Round) => Promise<Round> }
  steamId64: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  kills: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  deaths: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  suicides: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  score: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  team: { execute: (request?: boolean | number, defaultValue?: Team) => Promise<Team> }
  steamUser: SteamUserPromiseChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Promise<SteamUser | null>
  }
}

export interface PlayerRoundStatsObservableChain {
  round: RoundObservableChain & { execute: (request: RoundRequest, defaultValue?: Round) => Observable<Round> }
  steamId64: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  kills: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  deaths: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  suicides: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  score: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  team: { execute: (request?: boolean | number, defaultValue?: Team) => Observable<Team> }
  steamUser: SteamUserObservableChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Observable<SteamUser | null>
  }
}

export interface SteamUserPromiseChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  name: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  avatarBigUrl: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  avatarMediumUrl: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
}

export interface SteamUserObservableChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  name: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  avatarBigUrl: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  avatarMediumUrl: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
}

export interface PaginatedPlayerRoundWeaponStatsPromiseChain {
  content: {
    execute: (
      request: PlayerRoundWeaponStatsRequest,
      defaultValue?: PlayerRoundWeaponStats[] | null,
    ) => Promise<PlayerRoundWeaponStats[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedPlayerRoundWeaponStatsObservableChain {
  content: {
    execute: (
      request: PlayerRoundWeaponStatsRequest,
      defaultValue?: PlayerRoundWeaponStats[] | null,
    ) => Observable<PlayerRoundWeaponStats[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PlayerRoundWeaponStatsPromiseChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  round: RoundPromiseChain & { execute: (request: RoundRequest, defaultValue?: Round) => Promise<Round> }
  weapon: WeaponPromiseChain & { execute: (request: WeaponRequest, defaultValue?: Weapon) => Promise<Weapon> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  shotsHead: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  shotsChest: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  shotsLegs: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  shotsArms: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  shotsFired: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  steamUser: SteamUserPromiseChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Promise<SteamUser | null>
  }
}

export interface PlayerRoundWeaponStatsObservableChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  round: RoundObservableChain & { execute: (request: RoundRequest, defaultValue?: Round) => Observable<Round> }
  weapon: WeaponObservableChain & { execute: (request: WeaponRequest, defaultValue?: Weapon) => Observable<Weapon> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  shotsHead: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  shotsChest: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  shotsLegs: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  shotsArms: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  shotsFired: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  steamUser: SteamUserObservableChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Observable<SteamUser | null>
  }
}

export interface WeaponPromiseChain {
  name: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  weaponType: { execute: (request?: boolean | number, defaultValue?: WeaponType) => Promise<WeaponType> }
}

export interface WeaponObservableChain {
  name: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  weaponType: { execute: (request?: boolean | number, defaultValue?: WeaponType) => Observable<WeaponType> }
}

export interface PaginatedPlayerStatisticsPromiseChain {
  content: {
    execute: (
      request: PlayerStatisticsRequest,
      defaultValue?: PlayerStatistics[] | null,
    ) => Promise<PlayerStatistics[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedPlayerStatisticsObservableChain {
  content: {
    execute: (
      request: PlayerStatisticsRequest,
      defaultValue?: PlayerStatistics[] | null,
    ) => Observable<PlayerStatistics[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PlayerStatisticsPromiseChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  rank: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  kills: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  deaths: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  suicides: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  killDeathRatio: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  totalScore: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  numberGamesPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  numberRoundsPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  avgDamagePerRound: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  avgScorePerRound: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  steamUser: SteamUserPromiseChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Promise<SteamUser | null>
  }
}

export interface PlayerStatisticsObservableChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  rank: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  kills: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  deaths: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  suicides: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  killDeathRatio: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  totalScore: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  numberGamesPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  numberRoundsPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  avgDamagePerRound: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  avgScorePerRound: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  steamUser: SteamUserObservableChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Observable<SteamUser | null>
  }
}

export interface PlayerWeaponStatisticsPromiseChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  totalShots: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  shotsChest: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  shotsLegs: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  shotsArms: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  shotsHead: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  weapon: WeaponPromiseChain & { execute: (request: WeaponRequest, defaultValue?: Weapon) => Promise<Weapon> }
  steamUser: SteamUserPromiseChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Promise<SteamUser | null>
  }
}

export interface PlayerWeaponStatisticsObservableChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  totalShots: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  shotsChest: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  shotsLegs: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  shotsArms: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  shotsHead: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  weapon: WeaponObservableChain & { execute: (request: WeaponRequest, defaultValue?: Weapon) => Observable<Weapon> }
  steamUser: SteamUserObservableChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Observable<SteamUser | null>
  }
}

export interface PaginatedGameserverPromiseChain {
  content: { execute: (request: GameserverRequest, defaultValue?: Gameserver[] | null) => Promise<Gameserver[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedGameserverObservableChain {
  content: { execute: (request: GameserverRequest, defaultValue?: Gameserver[] | null) => Observable<Gameserver[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PaginatedRegisteredPlayersPromiseChain {
  content: {
    execute: (
      request: RegisteredPlayerRequest,
      defaultValue?: RegisteredPlayer[] | null,
    ) => Promise<RegisteredPlayer[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedRegisteredPlayersObservableChain {
  content: {
    execute: (
      request: RegisteredPlayerRequest,
      defaultValue?: RegisteredPlayer[] | null,
    ) => Observable<RegisteredPlayer[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface RegisteredPlayerPromiseChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  visibleRole: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  rootAdmin: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  kick: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  ban: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  tempKickBan: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  mute: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  makeTeams: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  reservedSlots: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  broadcastMessage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  gameControl: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  steamUser: SteamUserPromiseChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Promise<SteamUser | null>
  }
}

export interface RegisteredPlayerObservableChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  visibleRole: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  rootAdmin: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  kick: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  ban: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  tempKickBan: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  mute: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  makeTeams: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  reservedSlots: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  broadcastMessage: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  gameControl: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  steamUser: SteamUserObservableChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Observable<SteamUser | null>
  }
}

export interface PaginatedBanPromiseChain {
  content: { execute: (request: BanRequest, defaultValue?: Ban[] | null) => Promise<Ban[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedBanObservableChain {
  content: { execute: (request: BanRequest, defaultValue?: Ban[] | null) => Observable<Ban[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface BanPromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  bannedById64: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  createdAt: { execute: (request?: boolean | number, defaultValue?: DateTime) => Promise<DateTime> }
  expiredAt: { execute: (request?: boolean | number, defaultValue?: DateTime) => Promise<DateTime> }
  reason: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  gameserver: GameserverPromiseChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver | null) => Promise<Gameserver | null>
  }
  id1: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  id2: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  bannedSteamUser: SteamUserPromiseChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Promise<SteamUser | null>
  }
  bannedBySteamUser: SteamUserPromiseChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Promise<SteamUser | null>
  }
}

export interface BanObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  bannedById64: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  createdAt: { execute: (request?: boolean | number, defaultValue?: DateTime) => Observable<DateTime> }
  expiredAt: { execute: (request?: boolean | number, defaultValue?: DateTime) => Observable<DateTime> }
  reason: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  gameserver: GameserverObservableChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver | null) => Observable<Gameserver | null>
  }
  id1: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  id2: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  bannedSteamUser: SteamUserObservableChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Observable<SteamUser | null>
  }
  bannedBySteamUser: SteamUserObservableChain & {
    execute: (request: SteamUserRequest, defaultValue?: SteamUser | null) => Observable<SteamUser | null>
  }
}

export interface PaginatedGameserverConfigPromiseChain {
  content: {
    execute: (
      request: GameserverConfigRequest,
      defaultValue?: GameserverConfig[] | null,
    ) => Promise<GameserverConfig[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedGameserverConfigObservableChain {
  content: {
    execute: (
      request: GameserverConfigRequest,
      defaultValue?: GameserverConfig[] | null,
    ) => Observable<GameserverConfig[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PaginatedMatchConfigPromiseChain {
  content: { execute: (request: MatchConfigRequest, defaultValue?: MatchConfig[] | null) => Promise<MatchConfig[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedMatchConfigObservableChain {
  content: {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig[] | null) => Observable<MatchConfig[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface PaginatedAuthKeyPromiseChain {
  content: { execute: (request: AuthKeyRequest, defaultValue?: AuthKey[] | null) => Promise<AuthKey[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedAuthKeyObservableChain {
  content: { execute: (request: AuthKeyRequest, defaultValue?: AuthKey[] | null) => Observable<AuthKey[] | null> }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface AuthKeyPromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  authKey: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  description: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  lastUse: { execute: (request?: boolean | number, defaultValue?: DateTime) => Promise<DateTime> }
}

export interface AuthKeyObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  authKey: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  description: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  lastUse: { execute: (request?: boolean | number, defaultValue?: DateTime) => Observable<DateTime> }
}

export interface AppConfigPromiseChain {
  instanceId: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  publicStats: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  banlistPartners: { execute: (request?: boolean | number, defaultValue?: String[] | null) => Promise<String[] | null> }
  publicBanQuery: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Promise<Boolean | null> }
  masterserverKey: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  steamWebApiKey: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  ownAddress: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  appInfo: AppInfoPromiseChain & { execute: (request: AppInfoRequest, defaultValue?: AppInfo) => Promise<AppInfo> }
}

export interface AppConfigObservableChain {
  instanceId: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  publicStats: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  banlistPartners: { execute: (request?: boolean | number, defaultValue?: String[] | null) => Observable<String[] | null> }
  publicBanQuery: { execute: (request?: boolean | number, defaultValue?: Boolean | null) => Observable<Boolean | null> }
  masterserverKey: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  steamWebApiKey: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  ownAddress: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  appInfo: AppInfoObservableChain & { execute: (request: AppInfoRequest, defaultValue?: AppInfo) => Observable<AppInfo> }
}

export interface AppInfoPromiseChain {
  gamesPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  roundsPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  activeBans: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  uniquePlayers: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface AppInfoObservableChain {
  gamesPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  roundsPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  activeBans: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  uniquePlayers: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface MutationPromiseChain {
  deleteGames: (args: {
    gameInputs: GameInput[]
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateGame: (args: {
    gameInput: GameInput
  }) => GamePromiseChain & { execute: (request: GameRequest, defaultValue?: Game) => Promise<Game> }
  deleteRounds: (args: {
    roundInputs: RoundInput[]
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateRound: (args: {
    roundInput: RoundInput
  }) => RoundPromiseChain & { execute: (request: RoundRequest, defaultValue?: Round) => Promise<Round> }
  createUpdatePlayerRoundStats: (args: {
    playerRoundStatsInput: PlayerRoundStatsInput[]
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  createUpdatePlayerRoundWeaponStats: (args: {
    playerRoundWeaponStatsInput: PlayerRoundWeaponStatsInput[]
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  deleteGameserver: (args: {
    gameserverId: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateGameserver: (args: {
    gameserver: GameserverInput
  }) => GameserverPromiseChain & { execute: (request: GameserverRequest, defaultValue?: Gameserver) => Promise<Gameserver> }
  /** Only applies to gameserver key which is set for authorization */
  updateGameserver: (args: {
    gameserverUpdate: GameserverUpdateInput
  }) => GameserverPromiseChain & { execute: (request: GameserverRequest, defaultValue?: Gameserver) => Promise<Gameserver> }
  deleteRegisteredPlayer: (args: {
    steamId64: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  createUpdateRegisteredPlayer: (args: {
    registeredPlayer: RegisteredPlayerInput
  }) => RegisteredPlayerPromiseChain & {
    execute: (request: RegisteredPlayerRequest, defaultValue?: RegisteredPlayer) => Promise<RegisteredPlayer>
  }
  deleteBan: (args: {
    banId: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateBan: (args: {
    banInput: BanInput
  }) => BanPromiseChain & { execute: (request: BanRequest, defaultValue?: Ban) => Promise<Ban> }
  authPlayerToken: (args: {
    steamId64: String
  }) => { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  deleteGameserverConfig: (args: {
    gameserverId: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  createUpdateGameserverConfig: (args: {
    gameserverConfig: GameserverConfigInput
  }) => GameserverConfigPromiseChain & {
    execute: (request: GameserverConfigRequest, defaultValue?: GameserverConfig) => Promise<GameserverConfig>
  }
  /** Used to assign MatchConfig and password to a server from the game by an authed player */
  assignMatchConfig: (args: {
    gameserverConfig: GameserverConfigInput
  }) => GameserverConfigPromiseChain & {
    execute: (request: GameserverConfigRequest, defaultValue?: GameserverConfig) => Promise<GameserverConfig>
  }
  deleteMatchConfig: (args: {
    options: MatchConfigQuery
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateMatchConfig: (args: {
    matchConfig: MatchConfigInput
  }) => MatchConfigPromiseChain & {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig) => Promise<MatchConfig>
  }
  deleteAuthKey: (args: {
    authKey: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateAuthKey: (args: {
    authKey: AuthKeyInput
  }) => AuthKeyPromiseChain & { execute: (request: AuthKeyRequest, defaultValue?: AuthKey) => Promise<AuthKey> }
  login: (args: {
    password: String
  }) => LoginResponsePromiseChain & {
    execute: (request: LoginResponseRequest, defaultValue?: LoginResponse) => Promise<LoginResponse>
  }
  loginDev: (args: {
    password: String
  }) => LoginResponsePromiseChain & {
    execute: (request: LoginResponseRequest, defaultValue?: LoginResponse) => Promise<LoginResponse>
  }
  updateAppConfig: (args: {
    appConfig: AppConfigInput
  }) => AppConfigPromiseChain & { execute: (request: AppConfigRequest, defaultValue?: AppConfig) => Promise<AppConfig> }
}

export interface MutationObservableChain {
  deleteGames: (args: {
    gameInputs: GameInput[]
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateGame: (args: {
    gameInput: GameInput
  }) => GameObservableChain & { execute: (request: GameRequest, defaultValue?: Game) => Observable<Game> }
  deleteRounds: (args: {
    roundInputs: RoundInput[]
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateRound: (args: {
    roundInput: RoundInput
  }) => RoundObservableChain & { execute: (request: RoundRequest, defaultValue?: Round) => Observable<Round> }
  createUpdatePlayerRoundStats: (args: {
    playerRoundStatsInput: PlayerRoundStatsInput[]
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  createUpdatePlayerRoundWeaponStats: (args: {
    playerRoundWeaponStatsInput: PlayerRoundWeaponStatsInput[]
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  deleteGameserver: (args: {
    gameserverId: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateGameserver: (args: {
    gameserver: GameserverInput
  }) => GameserverObservableChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver) => Observable<Gameserver>
  }
  /** Only applies to gameserver key which is set for authorization */
  updateGameserver: (args: {
    gameserverUpdate: GameserverUpdateInput
  }) => GameserverObservableChain & {
    execute: (request: GameserverRequest, defaultValue?: Gameserver) => Observable<Gameserver>
  }
  deleteRegisteredPlayer: (args: {
    steamId64: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  createUpdateRegisteredPlayer: (args: {
    registeredPlayer: RegisteredPlayerInput
  }) => RegisteredPlayerObservableChain & {
    execute: (request: RegisteredPlayerRequest, defaultValue?: RegisteredPlayer) => Observable<RegisteredPlayer>
  }
  deleteBan: (args: {
    banId: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateBan: (args: {
    banInput: BanInput
  }) => BanObservableChain & { execute: (request: BanRequest, defaultValue?: Ban) => Observable<Ban> }
  authPlayerToken: (args: {
    steamId64: String
  }) => { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  deleteGameserverConfig: (args: {
    gameserverId: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  createUpdateGameserverConfig: (args: {
    gameserverConfig: GameserverConfigInput
  }) => GameserverConfigObservableChain & {
    execute: (request: GameserverConfigRequest, defaultValue?: GameserverConfig) => Observable<GameserverConfig>
  }
  /** Used to assign MatchConfig and password to a server from the game by an authed player */
  assignMatchConfig: (args: {
    gameserverConfig: GameserverConfigInput
  }) => GameserverConfigObservableChain & {
    execute: (request: GameserverConfigRequest, defaultValue?: GameserverConfig) => Observable<GameserverConfig>
  }
  deleteMatchConfig: (args: {
    options: MatchConfigQuery
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateMatchConfig: (args: {
    matchConfig: MatchConfigInput
  }) => MatchConfigObservableChain & {
    execute: (request: MatchConfigRequest, defaultValue?: MatchConfig) => Observable<MatchConfig>
  }
  deleteAuthKey: (args: {
    authKey: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  /** X-Request-ID must be set in header */
  createUpdateAuthKey: (args: {
    authKey: AuthKeyInput
  }) => AuthKeyObservableChain & { execute: (request: AuthKeyRequest, defaultValue?: AuthKey) => Observable<AuthKey> }
  login: (args: {
    password: String
  }) => LoginResponseObservableChain & {
    execute: (request: LoginResponseRequest, defaultValue?: LoginResponse) => Observable<LoginResponse>
  }
  loginDev: (args: {
    password: String
  }) => LoginResponseObservableChain & {
    execute: (request: LoginResponseRequest, defaultValue?: LoginResponse) => Observable<LoginResponse>
  }
  updateAppConfig: (args: {
    appConfig: AppConfigInput
  }) => AppConfigObservableChain & {
    execute: (request: AppConfigRequest, defaultValue?: AppConfig) => Observable<AppConfig>
  }
}

export interface LoginResponsePromiseChain {
  appConfig: AppConfigPromiseChain & { execute: (request: AppConfigRequest, defaultValue?: AppConfig) => Promise<AppConfig> }
  jwt: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
}

export interface LoginResponseObservableChain {
  appConfig: AppConfigObservableChain & {
    execute: (request: AppConfigRequest, defaultValue?: AppConfig) => Observable<AppConfig>
  }
  jwt: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
}
