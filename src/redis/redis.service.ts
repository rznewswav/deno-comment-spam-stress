import { HealthController } from "../controllers/health.controller.ts";
import { msgLog } from "../log/message.log.ts";
import {
  config,
  ConnectRedis,
  Redis,
  RedisCommands,
} from "../../deno_modules/deps.ts";
const env = config();
Object.assign(env, Deno.env.toObject());

class RedisServiceProxy {
  redis: Redis | null = null;
  proxy() {
    // deno-lint-ignore no-explicit-any
    let currentObj: any = this.redis;
    // deno-lint-ignore no-explicit-any
    const bound: any = this.redis;

    do {
      const props = Object.getOwnPropertyNames(currentObj);
      for (const prop of props) {
        const descriptor = Object.getOwnPropertyDescriptor(currentObj, prop);
        if (!descriptor) {
          continue;
        }

        if (descriptor.get) {
          continue;
        }

        // if (cls === this.boundRepo[prop]) {
        //   continue;
        // }

        if (prop === "constructor") {
          continue;
        }

        if (typeof bound[prop] === "function") {
          const boundedMethod = bound[prop].bind(bound);
          Object.defineProperty(this, prop, {
            get() {
              return boundedMethod;
            },
          });
        }
      }
    } while ((currentObj = Object.getPrototypeOf(currentObj)));
  }

  async start(): Promise<void> {
    HealthController.registerPatient("cache", this.isHealthy.bind(this));
    const hostNamePort = {
      hostname: env.REDIS_HOST,
      port: env.REDIS_PORT ?? "6379",
    };
    console.log(
      `{"message":"redis config","config":{"hostname":"${hostNamePort.hostname}","port":"${hostNamePort.port}"}}`,
    );
    this.redis = await ConnectRedis({ ...hostNamePort });
    this.proxy();

    globalThis.addEventListener("unload", () => {
      this.redis?.close();
    });
  }

  async isHealthy(): Promise<string | null> {
    if (this.redis === null) {
      return "redis is not started";
    }

    try {
      await this.redis.ping();
      return null;
    } catch (error) {
      return error?.message;
    }
  }
}

export const RedisService = RedisServiceProxy as unknown as {
  new (): RedisServiceProxy & RedisCommands;
};

if (import.meta.main) {
  const redisService = new RedisService();
  await redisService.start();
  const pong = await redisService.ping();
  msgLog(`server is alive: ${pong}`);
}
