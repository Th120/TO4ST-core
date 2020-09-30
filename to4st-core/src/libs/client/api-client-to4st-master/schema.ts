import { Observable } from 'rxjs'

export interface Query {
  authKeys: PaginatedAuthKey
  authKey: AuthKey | null
  authValid: Boolean
  appConfig: AppConfig
  communityBackendStatistics: PaginatedGlobalPlayerStatistics
  communityBackend: CommunityBackend
  communityBackends: PaginatedCommunityBackend
  __typename: 'Query'
}

/** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
export type Int = number

/** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
export type String = string

/** The `Boolean` scalar type represents `true` or `false`. */
export type Boolean = boolean

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

/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
export type DateTime = any

export interface AppConfig {
  instanceId: String | null
  steamWebApiKey: String | null
  __typename: 'AppConfig'
}

export enum OrderPlayerStats {
  sumKills = 'sumKills',
  sumDeaths = 'sumDeaths',
  sumSuicides = 'sumSuicides',
  sumDamage = 'sumDamage',
  sumScore = 'sumScore',
  sumRoundsPlayed = 'sumRoundsPlayed',
  sumGamesPlayed = 'sumGamesPlayed',
  averageKillDeath = 'averageKillDeath',
  averageDamagePerRound = 'averageDamagePerRound',
  averageScorePerRound = 'averageScorePerRound',
}

export interface PaginatedGlobalPlayerStatistics {
  content: GlobalPlayerStatistics[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedGlobalPlayerStatistics'
}

export interface GlobalPlayerStatistics {
  steamId64: String
  rank: Int
  kills: Int
  deaths: Int
  suicides: Int
  totalScore: Int
  totalDamage: Int
  numberGamesPlayed: Int
  numberRoundsPlayed: Int
  killDeathRatio: Float
  avgDamagePerRound: Int
  avgScorePerRound: Int
  __typename: 'GlobalPlayerStatistics'
}

/** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
export type Float = number

export interface CommunityBackend {
  id: Int
  masterserverKey: String
  description: String
  contact: String
  lastUrl: String | null
  enabledForStatisticsAggregation: Boolean
  lastHeartbeat: DateTime | null
  currentState: DateTime | null
  lastUpdateAttempt: DateTime | null
  aggregationRunningSince: DateTime | null
  __typename: 'CommunityBackend'
}

export interface PaginatedCommunityBackend {
  content: CommunityBackend[] | null
  totalCount: Int
  pageCount: Int
  __typename: 'PaginatedCommunityBackend'
}

export interface Mutation {
  deleteAuthKey: Boolean
  /** X-Request-ID must be set in header */
  createUpdateAuthKey: AuthKey
  login: LoginResponse
  loginDev: LoginResponse
  updateAppConfig: AppConfig
  createUpdateCommunityBackend: CommunityBackend
  deleteCommunityBackend: Boolean
  heartBeat: Boolean
  __typename: 'Mutation'
}

export interface LoginResponse {
  appConfig: AppConfig
  jwt: String
  __typename: 'LoginResponse'
}

export interface GameMode {
  name: String
  isTeamBased: Boolean
  __typename: 'GameMode'
}

export interface QueryRequest {
  authKeys?: [{ options: AuthKeyQuery }, PaginatedAuthKeyRequest]
  authKey?: [{ authKey: String }, AuthKeyRequest]
  authValid?: boolean | number
  appConfig?: [{ cached?: Boolean | null }, AppConfigRequest] | AppConfigRequest
  communityBackendStatistics?: [{ options: CommunityBackendStatisticsQuery }, PaginatedGlobalPlayerStatisticsRequest]
  communityBackend?: [{ id: Float }, CommunityBackendRequest]
  communityBackends?: [{ options: CommunityBackendQuery }, PaginatedCommunityBackendRequest]
  __typename?: boolean | number
  __scalar?: boolean | number
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
  steamWebApiKey?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface CommunityBackendStatisticsQuery {
  page?: Int | null
  pageSize?: Int | null
  month?: Int | null
  year?: Int | null
  steamId64?: String | null
  orderDesc?: Boolean | null
  orderBy?: OrderPlayerStats | null
  gameModeName?: String | null
}

export interface PaginatedGlobalPlayerStatisticsRequest {
  content?: GlobalPlayerStatisticsRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface GlobalPlayerStatisticsRequest {
  steamId64?: boolean | number
  rank?: boolean | number
  kills?: boolean | number
  deaths?: boolean | number
  suicides?: boolean | number
  totalScore?: boolean | number
  totalDamage?: boolean | number
  numberGamesPlayed?: boolean | number
  numberRoundsPlayed?: boolean | number
  killDeathRatio?: boolean | number
  avgDamagePerRound?: boolean | number
  avgScorePerRound?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface CommunityBackendRequest {
  id?: boolean | number
  masterserverKey?: boolean | number
  description?: boolean | number
  contact?: boolean | number
  lastUrl?: boolean | number
  enabledForStatisticsAggregation?: boolean | number
  lastHeartbeat?: boolean | number
  currentState?: boolean | number
  lastUpdateAttempt?: boolean | number
  aggregationRunningSince?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface CommunityBackendQuery {
  page?: Int | null
  pageSize?: Int | null
  search?: String | null
  orderDesc?: Boolean | null
}

export interface PaginatedCommunityBackendRequest {
  content?: CommunityBackendRequest
  totalCount?: boolean | number
  pageCount?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

export interface MutationRequest {
  deleteAuthKey?: [{ authKey: String }]
  /** X-Request-ID must be set in header */
  createUpdateAuthKey?: [{ authKey: AuthKeyInput }, AuthKeyRequest]
  login?: [{ password: String }, LoginResponseRequest]
  loginDev?: [{ password: String }, LoginResponseRequest]
  updateAppConfig?: [{ appConfig: AppConfigInput }, AppConfigRequest]
  createUpdateCommunityBackend?: [{ communityBackend: CommunityBackendInput }, CommunityBackendRequest]
  deleteCommunityBackend?: [{ id: Float }]
  heartBeat?: [{ address: String }]
  __typename?: boolean | number
  __scalar?: boolean | number
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
  steamWebApiKey?: String | null
  password?: String | null
}

export interface CommunityBackendInput {
  id?: Int | null
  masterserverKey?: String | null
  description?: String | null
  contact?: String | null
  enabledForStatisticsAggregation?: Boolean | null
}

export interface GameModeRequest {
  name?: boolean | number
  isTeamBased?: boolean | number
  __typename?: boolean | number
  __scalar?: boolean | number
}

const Query_possibleTypes = ['Query']
export const isQuery = (obj: { __typename: String }): obj is Query => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return Query_possibleTypes.includes(obj.__typename)
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

const PaginatedGlobalPlayerStatistics_possibleTypes = ['PaginatedGlobalPlayerStatistics']
export const isPaginatedGlobalPlayerStatistics = (obj: { __typename: String }): obj is PaginatedGlobalPlayerStatistics => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedGlobalPlayerStatistics_possibleTypes.includes(obj.__typename)
}

const GlobalPlayerStatistics_possibleTypes = ['GlobalPlayerStatistics']
export const isGlobalPlayerStatistics = (obj: { __typename: String }): obj is GlobalPlayerStatistics => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return GlobalPlayerStatistics_possibleTypes.includes(obj.__typename)
}

const CommunityBackend_possibleTypes = ['CommunityBackend']
export const isCommunityBackend = (obj: { __typename: String }): obj is CommunityBackend => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return CommunityBackend_possibleTypes.includes(obj.__typename)
}

const PaginatedCommunityBackend_possibleTypes = ['PaginatedCommunityBackend']
export const isPaginatedCommunityBackend = (obj: { __typename: String }): obj is PaginatedCommunityBackend => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return PaginatedCommunityBackend_possibleTypes.includes(obj.__typename)
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

const GameMode_possibleTypes = ['GameMode']
export const isGameMode = (obj: { __typename: String }): obj is GameMode => {
  if (!obj.__typename) throw new Error('__typename is missing')
  return GameMode_possibleTypes.includes(obj.__typename)
}

export interface QueryPromiseChain {
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
  communityBackendStatistics: (args: {
    options: CommunityBackendStatisticsQuery
  }) => PaginatedGlobalPlayerStatisticsPromiseChain & {
    execute: (
      request: PaginatedGlobalPlayerStatisticsRequest,
      defaultValue?: PaginatedGlobalPlayerStatistics,
    ) => Promise<PaginatedGlobalPlayerStatistics>
  }
  communityBackend: (args: {
    id: Float
  }) => CommunityBackendPromiseChain & {
    execute: (request: CommunityBackendRequest, defaultValue?: CommunityBackend) => Promise<CommunityBackend>
  }
  communityBackends: (args: {
    options: CommunityBackendQuery
  }) => PaginatedCommunityBackendPromiseChain & {
    execute: (
      request: PaginatedCommunityBackendRequest,
      defaultValue?: PaginatedCommunityBackend,
    ) => Promise<PaginatedCommunityBackend>
  }
}

export interface QueryObservableChain {
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
  communityBackendStatistics: (args: {
    options: CommunityBackendStatisticsQuery
  }) => PaginatedGlobalPlayerStatisticsObservableChain & {
    execute: (
      request: PaginatedGlobalPlayerStatisticsRequest,
      defaultValue?: PaginatedGlobalPlayerStatistics,
    ) => Observable<PaginatedGlobalPlayerStatistics>
  }
  communityBackend: (args: {
    id: Float
  }) => CommunityBackendObservableChain & {
    execute: (request: CommunityBackendRequest, defaultValue?: CommunityBackend) => Observable<CommunityBackend>
  }
  communityBackends: (args: {
    options: CommunityBackendQuery
  }) => PaginatedCommunityBackendObservableChain & {
    execute: (
      request: PaginatedCommunityBackendRequest,
      defaultValue?: PaginatedCommunityBackend,
    ) => Observable<PaginatedCommunityBackend>
  }
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
  steamWebApiKey: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
}

export interface AppConfigObservableChain {
  instanceId: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  steamWebApiKey: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
}

export interface PaginatedGlobalPlayerStatisticsPromiseChain {
  content: {
    execute: (
      request: GlobalPlayerStatisticsRequest,
      defaultValue?: GlobalPlayerStatistics[] | null,
    ) => Promise<GlobalPlayerStatistics[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedGlobalPlayerStatisticsObservableChain {
  content: {
    execute: (
      request: GlobalPlayerStatisticsRequest,
      defaultValue?: GlobalPlayerStatistics[] | null,
    ) => Observable<GlobalPlayerStatistics[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface GlobalPlayerStatisticsPromiseChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  rank: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  kills: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  deaths: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  suicides: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  totalScore: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  numberGamesPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  numberRoundsPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  killDeathRatio: { execute: (request?: boolean | number, defaultValue?: Float) => Promise<Float> }
  avgDamagePerRound: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  avgScorePerRound: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface GlobalPlayerStatisticsObservableChain {
  steamId64: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  rank: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  kills: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  deaths: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  suicides: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  totalScore: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  totalDamage: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  numberGamesPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  numberRoundsPlayed: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  killDeathRatio: { execute: (request?: boolean | number, defaultValue?: Float) => Observable<Float> }
  avgDamagePerRound: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  avgScorePerRound: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface CommunityBackendPromiseChain {
  id: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  masterserverKey: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  description: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  contact: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  lastUrl: { execute: (request?: boolean | number, defaultValue?: String | null) => Promise<String | null> }
  enabledForStatisticsAggregation: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  lastHeartbeat: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Promise<DateTime | null> }
  currentState: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Promise<DateTime | null> }
  lastUpdateAttempt: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Promise<DateTime | null> }
  aggregationRunningSince: {
    execute: (request?: boolean | number, defaultValue?: DateTime | null) => Promise<DateTime | null>
  }
}

export interface CommunityBackendObservableChain {
  id: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  masterserverKey: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  description: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  contact: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  lastUrl: { execute: (request?: boolean | number, defaultValue?: String | null) => Observable<String | null> }
  enabledForStatisticsAggregation: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  lastHeartbeat: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Observable<DateTime | null> }
  currentState: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Observable<DateTime | null> }
  lastUpdateAttempt: { execute: (request?: boolean | number, defaultValue?: DateTime | null) => Observable<DateTime | null> }
  aggregationRunningSince: {
    execute: (request?: boolean | number, defaultValue?: DateTime | null) => Observable<DateTime | null>
  }
}

export interface PaginatedCommunityBackendPromiseChain {
  content: {
    execute: (
      request: CommunityBackendRequest,
      defaultValue?: CommunityBackend[] | null,
    ) => Promise<CommunityBackend[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Promise<Int> }
}

export interface PaginatedCommunityBackendObservableChain {
  content: {
    execute: (
      request: CommunityBackendRequest,
      defaultValue?: CommunityBackend[] | null,
    ) => Observable<CommunityBackend[] | null>
  }
  totalCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
  pageCount: { execute: (request?: boolean | number, defaultValue?: Int) => Observable<Int> }
}

export interface MutationPromiseChain {
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
  createUpdateCommunityBackend: (args: {
    communityBackend: CommunityBackendInput
  }) => CommunityBackendPromiseChain & {
    execute: (request: CommunityBackendRequest, defaultValue?: CommunityBackend) => Promise<CommunityBackend>
  }
  deleteCommunityBackend: (args: {
    id: Float
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
  heartBeat: (args: {
    address: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
}

export interface MutationObservableChain {
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
  createUpdateCommunityBackend: (args: {
    communityBackend: CommunityBackendInput
  }) => CommunityBackendObservableChain & {
    execute: (request: CommunityBackendRequest, defaultValue?: CommunityBackend) => Observable<CommunityBackend>
  }
  deleteCommunityBackend: (args: {
    id: Float
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
  heartBeat: (args: {
    address: String
  }) => { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
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

export interface GameModePromiseChain {
  name: { execute: (request?: boolean | number, defaultValue?: String) => Promise<String> }
  isTeamBased: { execute: (request?: boolean | number, defaultValue?: Boolean) => Promise<Boolean> }
}

export interface GameModeObservableChain {
  name: { execute: (request?: boolean | number, defaultValue?: String) => Observable<String> }
  isTeamBased: { execute: (request?: boolean | number, defaultValue?: Boolean) => Observable<Boolean> }
}
