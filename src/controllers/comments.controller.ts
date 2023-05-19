import { sqlite, v5 } from "../../deno_modules/deps.ts";
import { Controller } from "../utils/controller.ts";
import { F, Reply, S } from "../utils/response.util.ts";
import { RedisService } from "../redis/redis.service.ts";
import { bench } from "../utils/benchmark.util.ts";

const redis = new RedisService();
redis
  .start()
  .catch(() => {
    console.error("redis: cannot start redis");
  });

const database = new sqlite("./data/database.db");
database.execute(`
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId VARCHAR(36),
  comment TEXT,
  isHidden INTEGER DEFAULT 0,
  createdAt TIMESTAMP
);
`);

export class GetCommentController implements Controller {
  method = "get";
  path = "/api/v1/comments";
  middlewares = void 0;
  handle(request: Request): Promise<Reply> {
    const url = new URL(request.url);
    const showHidden = url.searchParams.has("showHidden");
    let result = new Array<[number, string, string, number, string]>();
    if (showHidden) {
      result = database.query<typeof result[0]>(
        `SELECT * FROM comments ORDER BY createdAt DESC`,
      );
    } else {
      result = database.query<typeof result[0]>(
        `SELECT * FROM comments WHERE isHidden = 0 ORDER BY createdAt DESC`,
      );
    }

    return Promise.resolve(S({
      result: result.map(([id, userId, comment, isHidden, createdAt]) => ({
        id,
        userId: userId,
        comment,
        isHidden: !!isHidden,
        createdAt,
      })),
    }));
  }
}

const textEncoder = new TextEncoder();
async function createV5HashFromMessage(
  message: string,
  namespace = "cca64aab-bc15-4064-aba4-ded7d70c4ae4",
) {
  return await v5.generate(namespace, textEncoder.encode(message));
}

export class CreateCommentController implements Controller {
  method = "post";
  path = "/api/v1/comments";

  // two minutes
  detectSpamWithinS = 2 * 60;
  detectSpamWithinMs = this.detectSpamWithinS * 1000;
  spamCountThreshold = 3;

  async getUserSpamRedisKey(user: string, message: string) {
    const hashedMessage = await bench(
      async () => await createV5HashFromMessage(message),
      "v5",
      `${user} ${message}`,
    );
    return `user_spam:${user}:${hashedMessage}`;
  }

  async getSpamCount(user: string, comment: string) {
    const key = await bench(
      async () => await this.getUserSpamRedisKey(user, comment),
      "redis",
      `${user} ${comment}`,
    );
    const jsonOrNull = await redis.get(key);
    const spamStats = {
      key,
      count: 0,
      comment,
      messageIds: new Array<number>(),
    };
    if (jsonOrNull) {
      try {
        const parsedJson = JSON.parse(jsonOrNull);
        Object.assign(spamStats, parsedJson);
      } catch (error) {
        console.error("error at decoding " + jsonOrNull, error);
      }
    }

    return spamStats;
  }

  async saveSpamTracking(
    key: string,
    count: number,
    comment: string,
    messageIds: number[],
  ) {
    await bench(
      async () =>
        await redis.setex(
          key,
          this.detectSpamWithinS,
          JSON.stringify({
            count,
            comment,
            messageIds,
          }),
        ),
      "redis",
      `setex ${key}`,
    );
  }

  async handle(request: Request): Promise<Reply> {
    if (!request.headers.get("content-type")?.includes("json")) {
      return F({
        message: "requires json body instead",
      }).Status(400);
    }

    const user = request.headers.get("user");

    if (!user) {
      return F({
        message: "unauthenticated",
      }).Status(403);
    }

    const json = await request.json();
    if (!json.comment) {
      return F({
        message: "missing comment body",
      }).Status(400);
    }

    const comment = json.comment;

    const spamStats = await this.getSpamCount(user, comment);
    const { key, count: spamCount } = spamStats;
    const isSpam = spamCount >= this.spamCountThreshold;

    if (isSpam) {
      const questionMarks = Array.from({ length: spamStats.messageIds.length })
        .map(() => "?").join(",");
      database.query(
        `UPDATE comments SET isHidden = 1 WHERE id in (${questionMarks})`,
        spamStats.messageIds,
      );
      return F({
        message: "spam detected",
      }).Status(403);
    }

    const [rows] = database.query(
      `INSERT INTO comments(userId, comment, createdAt) VALUES (?, ?, ?) RETURNING id`,
      [user, json.comment, new Date()],
    );

    const id = rows.find((e) => e) as number;

    await this.saveSpamTracking(
      key,
      spamCount + 1,
      comment,
      [...spamStats.messageIds, id],
    );

    return S({
      message: "comment created",
    });
  }
}
