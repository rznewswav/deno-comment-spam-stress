import { Controller } from "./utils/controller.ts";
import { F } from "./utils/response.util.ts";
import { Context } from "./utils/context.util.ts";
import { benchRequest } from "./utils/benchmark.util.ts";
import { path } from "../deno_modules/deps.ts";

// Start listening on port 8080 of localhost.
export class Server {
  readonly methodPathControllers: Record<string, Record<string, Controller>> =
    {};
  readonly notRoundResponse = F({
    message: "method not found",
  })
    .Status(404);

  addController(controllerCls: { new (): Controller }) {
    const controller = new controllerCls();
    const normalizedPath = path.join("/", controller.path);
    const normalizedMethod = controller.method.toLocaleUpperCase("en-us");
    this.methodPathControllers[normalizedMethod] ??= {};
    this.methodPathControllers[normalizedMethod][normalizedPath] ??= controller;
  }

  onConnectionError(error: Error) {
    console.error(error);
  }

  async start(port = 3000) {
    const server = Deno.listen({ port });
    for await (const conn of server) {
      // In order to not be blocking, we need to handle each connection individually
      // without awaiting the function
      this
        .serveHttp(conn)
        .catch(this.onConnectionError.bind(this));
    }
  }

  async handle(context: Context, controller: Controller) {
    if (controller.middlewares) {
      for (const middleware of controller.middlewares) {
        await this.handle(context, middleware);
        if (context.sent) {
          return;
        }
      }
    }
    const response = await controller.handle(context.request.request);
    response.Send(context);
  }

  async serveHttp(conn: Deno.Conn) {
    // This "upgrades" a network connection into an HTTP connection.
    const httpConn = Deno.serveHttp(conn);
    // Each request sent over the HTTP connection will be yielded as an async
    // iterator from the HTTP connection.
    for await (const requestEvent of httpConn) {
      const request = requestEvent.request;
      const { method, url } = request;
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;

      const controller = this.methodPathControllers[method]?.[path];
      const context = new Context(requestEvent);
      if (!controller) {
        this.notRoundResponse.Send(context);
        return;
      }

      try {
        await benchRequest(
          async () => {
            await this.handle(context, controller);
          },
          context
        );
      } catch (error) {
        console.error(`Error at handling ${method} ${path}`);
        console.trace(error);
      }
    }
  }
}
