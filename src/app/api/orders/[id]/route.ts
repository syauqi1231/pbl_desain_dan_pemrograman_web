import type { NextResponse } from "next/server";
import { ApiError, apiError, noStoreJson, requireUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { orderWithItems, toOrderDetail } from "@/lib/orders";

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  { params }: Params,
): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where:
        user.role === "ADMIN"
          ? { id }
          : { id, userId: user.id },
      include: { ...orderWithItems, user: { select: { name: true, email: true } } },
    });

    if (!order) throw new ApiError(404, "Pesanan tidak ditemukan.");
    return noStoreJson({ order: toOrderDetail(order) });
  } catch (error) {
    return apiError(error);
  }
}
