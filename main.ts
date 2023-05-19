import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import {
  CreateCommentController,
  GetCommentController,
} from "./controllers/comments.controller.ts";
const env = config();
import { HealthController } from "./controllers/health.controller.ts";
import { Server } from "./server.ts";
import { msgLog } from "./log/message.log.ts";


const tryPort = Number(env.PORT);
const port = tryPort || 3000;
const server = new Server();
server.addController(HealthController);
server.addController(CreateCommentController);
server.addController(GetCommentController);
server.start(port);
msgLog(`Server started at port ${port}`);
