import { Reply } from "./response.util.ts";

export class Context {
  sent = false;
  stack = "";
  status = 200;
  headers: Record<string, string> = {};
  responses: Reply[] = [];

  constructor(readonly request: Deno.RequestEvent) {}

  exec() {
    while (!this.sent && this.responses.length) {
      const first = this.responses[0];
      this.responses = this.responses.slice(1);
      first.Send(this);
    }
  }

  success(data: Record<string, unknown>) {
    if (this.sent) {
      const sentError = new Error("response is sent at");
      sentError.stack = this.stack;
      const error = new Error("response is already sent", {
        cause: sentError,
      });
      throw error;
    }
    this.sent = true;
    Error.captureStackTrace(this);
    this.request.respondWith(Response.json(data, {
      status: this.status,
      headers: {
        ...this.headers,
      },
    })).catch((error: Error) => {
      console.error(error)
    });
  }

  fail(data: Record<string, unknown>) {
    if (this.sent) {
      const sentError = new Error("response is sent at");
      sentError.stack = this.stack;
      const error = new Error("response is already sent", {
        cause: sentError,
      });
      throw error;
    }
    this.sent = true;
    Error.captureStackTrace(this);
    this.request.respondWith(Response.json(data, {
      status: this.status,
      headers: {
        ...this.headers,
      },
    })).catch((error: Error) => {
      console.error(error)
    });
  }

  setStatus(status: number) {
    this.status = status;
  }

  setHeader(key: string, value: string) {
    this.headers[key] = value;
  }
}
