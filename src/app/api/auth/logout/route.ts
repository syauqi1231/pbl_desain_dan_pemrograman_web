import { NextResponse } from "next/server";
import { apiError, assertSameOrigin, noStoreJson } from "@/lib/api-helpers";
import { destroySession } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    await destroySession();
    return noStoreJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
