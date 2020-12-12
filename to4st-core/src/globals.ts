/**
 * Min length of authKey used by AuthKey / Gameserver
 */
export const MIN_AUTH_KEY_LENGTH = 32;

/**
 * Default password length
 */
export const DEFAULT_PW_LENGTH = 24;

/**
 * Min id length
 */
export const MIN_ID_LENGTH = 24;

/**
 * Default id length
 */
export const DEFAULT_ID_LENGTH = 26;

/**
 * Min password length
 */
export const MIN_PW_LENGTH = 9;

/**
 * Max password length
 */
export const MAX_PW_LENGTH = 64;

/**
 * Default secret length
 */
export const SECRET_LENGTH = 32;

/**
 * Alphabet used for default password generation
 */
export const PASSWORD_ALPHABET = "123456890ABCDEHKLMPSTUWXYZabcdtfqwxzeosymjurh$?%&!*#-+";

/**
 * Min length of string which is search
 */
export const MIN_SEARCH_LEN = 3;

/**
 * Max page size objects with steam id
 */
export const MAX_PAGE_SIZE_WITH_STEAMID = 100;

/**
 * Max page size default
 */
export const MAX_PAGE_SIZE = 200;

/**
 * Rounds used by bcrypt, 13 equals about 1 hash per minute
 */
export const BCRYPT_ROUNDS = 13;

/**
 * Default TTL of memoized methods
 */
export const TTL_CACHE_MS = 2 * 60 * 1000;

/**
 * Default cache prefetch for memoized methods
 */
export const CACHE_PREFETCH = 0.6;

/**
 * Max retries for transactions, etc (pRetry)
 */
export const MAX_RETRIES = 4;

/**
 * Default steam api key used for testing / development
 */
export const STEAM_API_KEY = process.env.STEAM_API_KEY_OVERRIDE || "";
