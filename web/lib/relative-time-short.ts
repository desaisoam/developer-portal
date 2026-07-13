/**
 * Abbreviated relative time for the verifications feed: "just now" (< 10s),
 * "14s ago", "2m ago", "3h ago", "2d ago", falling back to an absolute date once
 * the timestamp is more than a week old. `now` is injectable for deterministic
 * tests.
 */
export const relativeTimeShort = (
  input: string | Date,
  now: Date = new Date(),
): string => {
  const then = input instanceof Date ? input : new Date(input);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 10) {
    return "just now";
  }
  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return then.toLocaleDateString();
};
