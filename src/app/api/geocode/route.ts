import type { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  assertSameOrigin,
  clientKey,
  noStoreJson,
  rateLimit,
} from "@/lib/api-helpers";
import type { MapPlace } from "@/lib/maps";

type NominatimPlace = {
  lat?: string;
  lon?: string;
  display_name?: string;
};

const CACHE_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE = 200;
const MIN_GAP_MS = 1100;
const NOMINATIM_URL =
  process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org";

const cache = new Map<string, { at: number; place: MapPlace }>();
let lastRequestAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForNominatim(): Promise<void> {
  const wait = MIN_GAP_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

function pruneCache(): void {
  if (cache.size <= MAX_CACHE) return;
  const oldest = [...cache.entries()]
    .sort((a, b) => a[1].at - b[1].at)
    .slice(0, cache.size - MAX_CACHE);
  for (const [key] of oldest) cache.delete(key);
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    rateLimit(`geocode:${clientKey(request)}`, 20, 60 * 1000);

    const url = new URL(request.url);
    const query = (url.searchParams.get("q") ?? "").trim();

    if (query.length < 5) {
      throw new ApiError(400, "Tulis alamat lebih lengkap.");
    }
    if (query.length > 300) {
      throw new ApiError(400, "Alamat terlalu panjang.");
    }

    const key = query.toLowerCase();
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_MS) {
      return noStoreJson({ place: cached.place });
    }

    await waitForNominatim();

    let response: Response;
    try {
      response = await fetch(
        `${NOMINATIM_URL}/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
          headers: {
            "Accept-Language": "id,en;q=0.8",
            "User-Agent": `BoutiqueNC/1.0 (${process.env.APP_URL ?? "http://localhost:3000"})`,
          },
        },
      );
    } catch {
      throw new ApiError(503, "Peta tidak bisa dihubungi. Coba lagi.");
    }

    if (response.status === 429) {
      throw new ApiError(503, "Pencarian alamat sedang sibuk. Coba lagi sebentar.");
    }
    if (!response.ok) {
      throw new ApiError(502, "Peta tidak bisa dimuat. Coba lagi.");
    }

    const data = (await response.json()) as NominatimPlace[];
    const found = data[0];
    const lat = Number(found?.lat);
    const lon = Number(found?.lon);

    if (!found?.display_name || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new ApiError(
        404,
        "Alamat tidak ditemukan. Coba tulis jalan, kelurahan, dan kota.",
      );
    }

    const place: MapPlace = {
      displayName: found.display_name,
      lat,
      lon,
    };

    cache.set(key, { at: Date.now(), place });
    pruneCache();

    return noStoreJson({ place });
  } catch (error) {
    return apiError(error);
  }
}
