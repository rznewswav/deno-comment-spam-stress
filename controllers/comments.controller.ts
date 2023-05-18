import { Controller } from "../utils/controller.ts";
import { F, Reply, S } from "../utils/response.util.ts";
import { DB } from "https://deno.land/x/sqlite@v3.7.2/mod.ts";

const database = new DB("./data/database.db");
database.execute(`
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment TEXT,
  isHidden INTEGER DEFAULT 0,
  createdAt TIMESTAMP
);
`);

export class GetCommentController implements Controller {
  method = "get";
  path = "/api/v1/comments";
  middlewares = void 0;
  handle(_: Request): Promise<Reply> {
    const result = database.query<[number, string, number, string]>(
      `SELECT * FROM comments ORDER BY createdAt DESC`,
    );

    return Promise.resolve(S({
      result: result.map(([id, comment, isHidden, createdAt]) => ({
        id,
        comment,
        isHidden: !!isHidden,
        createdAt: new Date(createdAt)
      })),
    }));
  }
}

export class CreateCommentController implements Controller {
  method = "post";
  path = "/api/v1/comments";
  middlewares = void 0;
  async handle(request: Request): Promise<Reply> {
    if (!request.headers.get("content-type")?.includes("json")) {
      return F({
        message: "requires json body instead",
      }).Status(400);
    }

    const json = await request.json();
    if (!json.comment) {
      return F({
        message: "missing comment body",
      }).Status(400);
    }

    database.query(
      `INSERT INTO comments(comment, createdAt) VALUES (?, ?)`,
      [json.comment, new Date()],
    );

    return S({
      message: "comment created",
    });
  }
}
