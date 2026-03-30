import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const springBootUrl = `${config.apiUrl}/notifications/stream`;

  // ── Forward the SSE request to Spring Boot ────────────────────────────────

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(springBootUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Cookie: `access_token=${token}`,
        "Cache-Control": "no-cache",
      },
      // @ts-ignore — Node.js fetch supports this; suppresses body-buffering
      duplex: "half",
    });
  } catch (err) {
    console.error("[SSE proxy] Failed to connect to Spring Boot:", err);
    return new Response("SSE upstream unavailable", { status: 503 });
  }

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return new Response("SSE upstream error", {
      status: upstreamResponse.status,
    });
  }

  // ── Pipe the upstream stream to the browser ───────────────────────────────

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const abortController = new AbortController();

  // Abort upstream when browser disconnects
  request.signal.addEventListener("abort", () => {
    abortController.abort();
    writer.close().catch(() => {});
  });

  // Pipe upstream → transform stream (non-blocking)
  (async () => {
    const reader = upstreamResponse.body!.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || abortController.signal.aborted) break;
        await writer.write(value);
      }
    } catch (err) {
      // Upstream closed or client disconnected — not an error
    } finally {
      writer.close().catch(() => {});
      reader.releaseLock();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx buffering in production
    },
  });
}
