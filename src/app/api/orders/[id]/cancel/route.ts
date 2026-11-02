import type { NextResponse } from "next/server";
import {
  apiError,
  assertSameOrigin,
  noStoreJson,
  requireUser,
} from "@/lib/api-helpers";
import { cancelOwnOrder } from "@/lib/order-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const { id } = await params;
    const order = await cancelOwnOrder(id, user.id);
    return noStoreJson({ order });
  } catch (error) {
    return apiError(error);
  }
}
