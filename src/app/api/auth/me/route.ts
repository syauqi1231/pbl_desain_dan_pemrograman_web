import { NextResponse } from "next/server";
import { apiError, noStoreJson } from "@/lib/api-helpers";
import { getCurrentUser } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    return noStoreJson({ user });
  } catch (error) {
    return apiError(error);
  }
}
