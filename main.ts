// import { connect as ConnectRedis } from "https://deno.land/x/redis/mod.ts";
import { HealthController } from "./controllers/health.controller.ts";
import { Server } from "./server.ts";

const server = new Server()
server.addController(new HealthController())
server.start(3000)
console.log("Server started at port 3000")