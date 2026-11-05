import { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  assertSameOrigin,
  clientKey,
  noStoreJson,
  parseWith,
  rateLimit,
  readJson,
} from "@/lib/api-helpers";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatedMapUrl } from "@/lib/maps";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    rateLimit(`register:${clientKey(request)}`, 5, 15 * 60 * 1000);

    const body = parseWith(registerSchema, await readJson(request));
    const email = body.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, "Email ini sudah terdaftar. Coba masuk.");
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        passwordHash: await hashPassword(body.password),
        phone: body.phone.trim(),
        addressLine: body.addressLine.trim(),
        mapUrl: generatedMapUrl(body.addressLine),
        addressNote: body.addressNote?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        addressLine: true,
        mapUrl: true,
        addressNote: true,
      },
    });

    await createSession(user.id);
    return noStoreJson({ user }, 201);
  } catch (error) {
    return apiError(error);
  }
}
