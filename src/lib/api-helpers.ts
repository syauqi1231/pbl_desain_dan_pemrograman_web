import "server-only";

import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { getCurrentUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function apiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: "Terjadi kesalahan di server. Coba lagi." },
    { status: 500 },
  );
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const host = request.headers.get("host");
  if (!host) throw new ApiError(403, "Permintaan ditolak.");

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, "Permintaan ditolak.");
  }

  if (originHost !== host) {
    throw new ApiError(403, "Permintaan lintas situs ditolak.");
  }
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): void {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  current.count += 1;
  if (current.count > limit) {
    const seconds = Math.ceil((current.resetAt - now) / 1000);
    throw new ApiError(
      429,
      `Terlalu banyak percobaan. Coba lagi dalam ${seconds} detik.`,
    );
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Isi permintaan bukan JSON yang valid.");
  }
}

export function parseWith<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(
      400,
      "Periksa kembali isian yang ditandai.",
      result.error.flatten().fieldErrors,
    );
  }
  return result.data;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError(401, "Masuk dulu untuk melanjutkan.");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Halaman ini hanya untuk admin.");
  }
  return user;
}

export function noStoreJson(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
