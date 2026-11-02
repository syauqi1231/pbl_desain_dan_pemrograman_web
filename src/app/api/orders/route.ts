import type { NextResponse } from "next/server";
import {
  apiError,
  assertSameOrigin,
  noStoreJson,
  parseWith,
  readJson,
  requireUser,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/order-service";
import { orderWithItems, toOrderSummary } from "@/lib/orders";
import { orderCreateSchema } from "@/lib/validation";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const all = url.searchParams.get("semua") === "1" && user.role === "ADMIN";

    const rows = await prisma.order.findMany({
      where: all ? {} : { userId: user.id },
      include: { ...orderWithItems, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return noStoreJson({ orders: rows.map(toOrderSummary) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const body = parseWith(orderCreateSchema, await readJson(request));
    const order = await createOrder(user.id, body);
    return noStoreJson({ order }, 201);
  } catch (error) {
    return apiError(error);
  }
}
