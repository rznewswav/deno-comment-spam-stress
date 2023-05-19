import { benchLog } from "../log/bench.log.ts";
import { serverLog } from "../log/server.log.ts";
import { Context } from "./context.util.ts";

export async function benchRequest(
  fn: () => Promise<void>,
  context: Context,
): Promise<void> {
  const now = performance.now();
  let throwError = false;
  let error: unknown = null;
  try {
    await fn();
  } catch (e) {
    throwError = true;
    error = e;
  } finally {
    const end = performance.now();
    const timeTakenMs = end - now;
    const url = new URL(context.request.request.url)
    serverLog(context.request.request.method, timeTakenMs, url.pathname, context.status)
  }
  if (throwError) {
    throw error;
  }
}

export async function bench<T>(
  fn: () => Promise<T>,
  name: string,
  info: string | ((out?: T) => string),
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
    benchLog(name, timeTakenMs, typeof info === "string" ? info : info(out!))
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
    benchLog(name, timeTakenMs, info)
  }
  if (throwError) {
    throw error;
  } else {
    return out!;
  }
}
