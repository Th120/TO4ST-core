import jsSHA from "jssha";
import range from "lodash/range";

/**
 * CSS class list
 */
export type ClassList = string | Record<string, boolean>;

/**
 * Merge css classes
 * @param classes
 */
export const mergeClass = (...classes: ClassList[]) =>
  Object.entries(
    classes
      .map((c) => (typeof c === "string" ? { [c.trim()]: true } : c))
      .reduce((a, b) => ({ ...a, ...b }))
  )
    .filter(([_, cond]) => cond)
    .map(([c]) => c.trim())
    .join(" ");

/**
 * Extract error string from failed request
 * @param error
 */
export function extractGraphQLErrors(error: any): string {
  const err = error instanceof Object ? error : null;
  if (err) {
    return (
      err.errors
        ?.map((e) => e.message.toString())
        .join(",\n") || "GraphQL Error empty"
    );
  } else {
    return "Did not receive valid GraphQL Error";
  }
}

/**
 * Naive salting + password hash
 * @param pass
 */
export function hashPassword(pass: string) {
  const shaObj = new jsSHA("SHA3-256", "TEXT");
  shaObj.update(pass);
  shaObj.update("T04ST"); //salt just in case
  return shaObj.getHash("HEX");
}

/**
 * Splits array into n (almost) evenly sized chunks
 *
 * @param array
 * @param n
 * @returns always returns n chunks
 */
export function splitIntoNChunks<T>(array: T[], n: number): T[][] {
  n = Math.max(1, n);
  if (n === 1) {
    return [array];
  }
  return array.reduce(
    (last, curr, idx) => {
      last[idx % n].push(curr);
      return last;
    },
    range(n).map(() => [] as T[])
  );
}
