/**
 * World ID 4.0 nullifiers are stored as decimal strings (Hasura `numeric`).
 * Render them the way the verification feed shows a row: a `0x`-prefixed hex
 * string truncated to `0x` + 8 leading + `…` + 4 trailing hex chars, e.g.
 * `0x1f9a4c7e…b8e2`. Values with <= 12 hex chars are shown in full. Invalid or
 * empty input is returned unchanged rather than throwing. Nullifiers are
 * unsigned, so a negative value is invalid input and follows the same policy.
 */
export const formatNullifierHex = (nullifier: string): string => {
  if (!nullifier?.trim() || nullifier.trim().startsWith("-")) {
    return nullifier;
  }

  let hex: string;
  try {
    hex = BigInt(nullifier).toString(16);
  } catch {
    return nullifier;
  }

  if (hex.length <= 12) {
    return `0x${hex}`;
  }

  return `0x${hex.slice(0, 8)}…${hex.slice(-4)}`;
};
