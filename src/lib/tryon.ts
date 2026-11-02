import "server-only";

import { readProductImage } from "@/lib/storage";

export type FashnCategory = "tops" | "bottoms" | "one-pieces";
export type FashnPhotoType = "model" | "flat-lay";

export type TryOnFailure =
  | "timeout"
  | "rate-limit"
  | "unavailable"
  | "rejected";

export class TryOnProviderError extends Error {
  code: TryOnFailure;

  constructor(code: TryOnFailure, message: string) {
    super(message);
    this.name = "TryOnProviderError";
    this.code = code;
  }
}

export type TryOnOutcome = {
  provider: "fashn";
  buffer: Buffer;
  mime: string;
};

const DEFAULT_SPACE_URL = "https://fashn-ai-fashn-vton-1-5.hf.space";
const DEFAULT_TIMEOUT_MS = 100_000;
const MAX_RESULT_BYTES = 20 * 1024 * 1024;
const NUM_TIMESTEPS = 30;
const GUIDANCE_SCALE = 1.5;
const SEED = 42;

const categoryByValue: Record<string, FashnCategory> = {
  upper_body: "tops",
  lower_body: "bottoms",
  dresses: "one-pieces",
  tops: "tops",
  bottoms: "bottoms",
  "one-pieces": "one-pieces",
};

export function fashnCategory(value: string): FashnCategory | null {
  return categoryByValue[value] ?? null;
}

export function isFashnPhotoType(value: string | null): value is FashnPhotoType {
  return value === "model" || value === "flat-lay";
}

function spaceUrl(): string {
  return (process.env.FASHN_SPACE_URL?.trim() || DEFAULT_SPACE_URL).replace(
    /\/+$/,
    "",
  );
}

function timeoutMs(): number {
  const configured = Number(process.env.FASHN_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured >= 10_000) {
    return Math.min(configured, 280_000);
  }
  return DEFAULT_TIMEOUT_MS;
}

function authHeaders(): Record<string, string> {
  const token = process.env.HF_TOKEN?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normaliseMime(value: string): string {
  if (value === "image/jpg") return "image/jpeg";
  if (value === "image/png" || value === "image/webp") return value;
  return "image/jpeg";
}

function mimeForPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function dataUrl(mime: string, buffer: Buffer): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

type SseEvent = { event: string; data: string };

function parseSse(body: string): SseEvent[] {
  const events: SseEvent[] = [];

  for (const block of body.split(/\r?\n\r?\n/)) {
    let event = "message";
    const data: string[] = [];

    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        data.push(line.slice(5).trimStart());
      }
    }

    if (data.length > 0) events.push({ event, data: data.join("\n") });
  }

  return events;
}

function imageUrlFrom(data: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }

  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  if (typeof first === "string" && first.length > 0) return first;

  if (first && typeof first === "object" && "url" in first) {
    const url = (first as { url?: unknown }).url;
    if (typeof url === "string" && url.length > 0) return url;
  }

  return null;
}

function resultUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw, `${spaceUrl()}/`);
  } catch {
    throw new TryOnProviderError("rejected", "URL hasil tidak valid.");
  }

  const allowedHost = new URL(spaceUrl()).hostname;
  const host = url.hostname;
  if (
    url.protocol !== "https:" ||
    (host !== allowedHost && !host.endsWith(".hf.space"))
  ) {
    throw new TryOnProviderError("rejected", "URL hasil tidak dikenal.");
  }

  return url;
}

function failureForStatus(status: number): TryOnProviderError {
  if (status === 401 || status === 403) {
    return new TryOnProviderError(
      "rate-limit",
      "Akses ke Space FASHN ditolak. Periksa token Hugging Face.",
    );
  }
  if (status === 429) {
    return new TryOnProviderError(
      "rate-limit",
      "Kuota gratis FASHN sedang penuh.",
    );
  }
  if (status >= 500) {
    return new TryOnProviderError(
      "unavailable",
      "Space FASHN sedang sibuk atau tidur.",
    );
  }
  return new TryOnProviderError(
    "unavailable",
    `Space FASHN menolak permintaan (${status}).`,
  );
}

async function readFailureBody(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 400);
  } catch {
    return "";
  }
}

/**
 * Calls the official FASHN VTON v1.5 Hugging Face Space through its Gradio
 * queue API: POST /gradio_api/call/try_on, then GET the returned event stream.
 *
 * The Space is public, so HF_TOKEN is optional. It is still read server-side
 * when present to avoid the anonymous ZeroGPU quota.
 */
export async function runTryOn(input: {
  photo: File;
  garmentImage: string;
  category: FashnCategory;
  photoType: FashnPhotoType;
}): Promise<TryOnOutcome> {
  const base = spaceUrl();
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs());

  try {
    const [photoBuffer, garmentBuffer] = await Promise.all([
      input.photo.arrayBuffer().then((buffer) => Buffer.from(buffer)),
      readProductImage(input.garmentImage),
    ]);

    const payload = {
      data: [
        {
          url: dataUrl(normaliseMime(input.photo.type), photoBuffer),
          meta: { _type: "gradio.FileData" },
        },
        {
          url: dataUrl(mimeForPath(input.garmentImage), garmentBuffer),
          meta: { _type: "gradio.FileData" },
        },
        input.category,
        input.photoType,
        NUM_TIMESTEPS,
        GUIDANCE_SCALE,
        SEED,
        true,
      ],
    };

    let post: Response;
    try {
      post = await fetch(`${base}/gradio_api/call/try_on`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (error) {
      if (timedOut) {
        throw new TryOnProviderError(
          "timeout",
          "Permintaan ke FASHN melewati batas waktu.",
        );
      }
      throw new TryOnProviderError(
        "unavailable",
        error instanceof Error ? error.message : "Jaringan ke FASHN gagal.",
      );
    }

    if (!post.ok) {
      console.error(
        `[try-on] FASHN POST ${post.status}: ${await readFailureBody(post)}`,
      );
      throw failureForStatus(post.status);
    }

    const queued = (await post.json().catch(() => null)) as {
      event_id?: unknown;
    } | null;
    const eventId = queued?.event_id;

    if (typeof eventId !== "string" || eventId.length === 0) {
      throw new TryOnProviderError(
        "unavailable",
        "FASHN tidak mengembalikan ID antrean.",
      );
    }

    let stream: Response;
    try {
      stream = await fetch(
        `${base}/gradio_api/call/try_on/${encodeURIComponent(eventId)}`,
        {
          headers: { Accept: "text/event-stream", ...authHeaders() },
          signal: controller.signal,
          cache: "no-store",
        },
      );
    } catch (error) {
      if (timedOut) {
        throw new TryOnProviderError(
          "timeout",
          "Antrean GPU FASHN melewati batas waktu.",
        );
      }
      throw new TryOnProviderError(
        "unavailable",
        error instanceof Error ? error.message : "Koneksi antrean gagal.",
      );
    }

    if (!stream.ok) {
      console.error(`[try-on] FASHN stream ${stream.status}`);
      throw failureForStatus(stream.status);
    }

    let body: string;
    try {
      body = await stream.text();
    } catch (error) {
      if (timedOut) {
        throw new TryOnProviderError(
          "timeout",
          "Antrean GPU FASHN melewati batas waktu.",
        );
      }
      throw new TryOnProviderError(
        "unavailable",
        error instanceof Error ? error.message : "Stream hasil gagal dibaca.",
      );
    }

    if (timedOut) {
      throw new TryOnProviderError(
        "timeout",
        "Antrean GPU FASHN melewati batas waktu.",
      );
    }

    const events = parseSse(body);
    const failure = events.find((event) => event.event === "error");
    if (failure) {
      console.error(`[try-on] FASHN error event: ${failure.data.slice(0, 400)}`);
      throw new TryOnProviderError(
        "rejected",
        "FASHN tidak bisa memproses foto atau pakaian ini.",
      );
    }

    const complete = [...events]
      .reverse()
      .find((event) => event.event === "complete");
    if (!complete) {
      throw new TryOnProviderError(
        "unavailable",
        "FASHN tidak mengirim hasil akhir.",
      );
    }

    const rawUrl = imageUrlFrom(complete.data);
    if (!rawUrl) {
      throw new TryOnProviderError(
        "rejected",
        "FASHN tidak mengembalikan gambar.",
      );
    }

    const downloadUrl = resultUrl(rawUrl);
    let download: Response;
    try {
      download = await fetch(downloadUrl, {
        headers: authHeaders(),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (error) {
      if (timedOut) {
        throw new TryOnProviderError(
          "timeout",
          "Unduhan hasil FASHN melewati batas waktu.",
        );
      }
      throw new TryOnProviderError(
        "unavailable",
        error instanceof Error ? error.message : "Unduhan hasil gagal.",
      );
    }

    if (!download.ok) {
      throw failureForStatus(download.status);
    }

    const announced = Number(download.headers.get("content-length") ?? 0);
    if (announced > MAX_RESULT_BYTES) {
      throw new TryOnProviderError("rejected", "Hasil FASHN terlalu besar.");
    }

    const buffer = Buffer.from(await download.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_RESULT_BYTES) {
      throw new TryOnProviderError("rejected", "Hasil FASHN tidak valid.");
    }

    const contentType = download.headers.get("content-type") ?? "";
    const mime = contentType.includes("png")
      ? "image/png"
      : contentType.includes("webp")
        ? "image/webp"
        : contentType.includes("jpeg") || contentType.includes("jpg")
          ? "image/jpeg"
          : "image/webp";

    return { provider: "fashn", buffer, mime };
  } finally {
    clearTimeout(timer);
  }
}
