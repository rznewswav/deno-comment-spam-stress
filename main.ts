import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import {
  CreateCommentController,
  GetCommentController,
} from "./controllers/comments.controller.ts";
const env = config();
import { HealthController } from "./controllers/health.controller.ts";
import { RedisService } from "./redis/redis.service.ts";
import { Server } from "./server.ts";

const redis = new RedisService();
redis
  .start()
  .catch(() => {
    console.error("redis: cannot start redis");
  });

const tryPort = Number(env.PORT);
const port = tryPort || 3000;
const server = new Server();
server.addController(HealthController);
server.addController(CreateCommentController);
server.addController(GetCommentController);
server.start(port);
console.log(`Server started at port ${port}`);
