import { Context } from "./context.util.ts";
import { StringDefaultedMap } from "./string-defaulted-map.util.ts";

interface Payload {
  status: number;
  header: Record<string, string>;
  data: Record<string, unknown>;
}

export class Reply {
  data: Record<string, unknown> | null;
  status: number;
  next: boolean;
  success: boolean;
  header: StringDefaultedMap;

  constructor() {
    this.data = null;
    this.status = 200;
    this.next = false;
    this.success = false;
    this.header = new StringDefaultedMap();
  }

  public GetResponsePayload(): Payload {
    return {
      status: this.status,
      header: this.header.m,
      data: {
        success: this.success,
        data: this.data,
      },
    };
  }

  public Next(): boolean {
    return this.next;
  }

  public Send(ctx: Context): void {
    const payload = this.GetResponsePayload();

    for (const [key, value] of Object.entries(this.header.m)) {
      ctx.setHeader(key, value);
    }

    ctx.setStatus(this.status);

    if (this.Next()) {
      return;
    }

    if (this.Success()) {
      ctx.success(payload.data);
    } else {
      ctx.fail(payload.data);
    }
  }

  public Status(i: number): Reply {
    this.status = i;
    return this;
  }

  public Header(key: string, value: string): Reply {
    this.header.set(key, value);
    return this;
  }

  public Success(): boolean {
    return this.success;
  }
}

export function S(data: Record<string, unknown> | null = null): Reply {
  const response = new Reply();
  response.success = true;
  response.data = data;
  return response;
}

export function F(data: Record<string, unknown> | null = null): Reply {
  const response = new Reply();
  response.success = false;
  response.data = data;
  return response;
}
