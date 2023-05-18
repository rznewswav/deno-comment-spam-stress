import { Controller } from "../utils/controller.ts";
import { S } from "../utils/response.util.ts";
import { Reply } from "../utils/response.util.ts";

export class HealthController implements Controller {
  method = "get";
  path = "/api/v1/health";
  middlewares?: Controller[] | undefined;
  handle(_: Request): Promise<Reply> {
    return Promise.resolve(S({
      healthy: true,
      patients: [],
    }));
  }
}
