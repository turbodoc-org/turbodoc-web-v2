import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

const startFetch = createStartHandler(defaultStreamHandler);

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      return await startFetch(request, env, ctx);
    } catch (err) {
      const e = err as Error & { cause?: Error };
      return new Response(
        JSON.stringify({
          diag: true,
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
          causeName: e?.cause?.name,
          causeMessage: e?.cause?.message,
          causeStack: e?.cause?.stack,
        }),
        { status: 500, headers: { "content-type": "application/json" } },
      );
    }
  },
};
