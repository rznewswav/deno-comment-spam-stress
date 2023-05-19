import {
  CreateCommentController,
  GetCommentController,
} from "./controllers/comments.controller.ts";
import { HealthController } from "./controllers/health.controller.ts";
import { Server } from "./server.ts";
import { msgLog } from "./log/message.log.ts";
import { config } from "../deno_modules/deps.ts";
const env = config();


const tryPort = Number(env.PORT);
const port = tryPort || 3000;
const server = new Server();
server.addController(HealthController);
server.addController(CreateCommentController);
server.addController(GetCommentController);
server.start(port);
msgLog(`Server started at port ${port}`);
