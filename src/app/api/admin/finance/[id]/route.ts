import type { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  assertSameOrigin,
  noStoreJson,
  parseWith,
  rateLimit,
  readJson,
  requireAdmin,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { financeEntrySchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

async function existingEntry(id: string) {
  const entry = await prisma.financeEntry.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!entry) {
    throw new ApiError(404, "Catatan keuangan tidak ditemukan.");
  }
  return entry;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    const user = await requireAdmin();
    rateLimit(`finance-edit:${user.id}`, 60, 60_000);

    const { id } = await context.params;
    await existingEntry(id);

    const body = parseWith(financeEntrySchema, await readJson(request));
    const entry = await prisma.financeEntry.update({
      where: { id },
      data: {
        type: body.type,
        category: body.category.trim(),
        description: body.description.trim(),
        amount: body.amount,
        occurredAt: new Date(`${body.occurredAt}T00:00:00.000Z`),
      },
    });

    return noStoreJson({
      entry: {
        id: entry.id,
        type: entry.type,
        category: entry.category,
        description: entry.description,
        amount: entry.amount,
        occurredAt: entry.occurredAt.toISOString(),
        createdByName: user.name,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    const user = await requireAdmin();
    rateLimit(`finance-delete:${user.id}`, 60, 60_000);

    const { id } = await context.params;
    await existingEntry(id);
    await prisma.financeEntry.delete({ where: { id } });

    return noStoreJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
