import { Reply } from "./response.util.ts";

export interface Controller {
  readonly method: string;
  readonly path: string;
  readonly middlewares?: Controller[];
  handle(request: Request): Promise<Reply>;
}
