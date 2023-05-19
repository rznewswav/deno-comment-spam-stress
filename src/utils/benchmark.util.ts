import { benchLog } from "../log/bench.log.ts";

export async function bench<T>(
  fn: () => Promise<T>,
  name: string,
  info: string,
): Promise<T> {
  const now = performance.now();
  let throwError = false;
  let out: T;
  let error: unknown = null;
  try {
    out = await fn();
  } catch (e) {
    throwError = true;
    error = e;
  } finally {
    const end = performance.now();
    const timeTakenMs = end - now;
    const timeTakenS = (timeTakenMs / 1000).toFixed(2);
    benchLog(name, timeTakenS, info)
  }
  if (throwError) {
    throw error;
  } else {
    return out!;
  }
}

export function benchSync<T>(fn: () => T, name: string, info: string): T {
  const now = performance.now();
  let throwError = false;
  let out: T;
  let error: unknown = null;
  try {
    out = fn();
  } catch (e) {
    throwError = true;
    error = e;
  } finally {
    const end = performance.now();
    const timeTakenMs = end - now;
    const timeTakenS = (timeTakenMs / 1000).toFixed(2).padStart(6, " ");
    benchLog(name, timeTakenS, info)
  }
  if (throwError) {
    throw error;
  } else {
    return out!;
  }
}
