import type { NextResponse } from "next/server";
import {
  apiError,
  assertSameOrigin,
  noStoreJson,
  parseWith,
  rateLimit,
  readJson,
  requireAdmin,
} from "@/lib/api-helpers";
import { getFinanceSummary, listFinanceEntries } from "@/lib/finance";
import { prisma } from "@/lib/db";
import { financeEntrySchema } from "@/lib/validation";

export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();
    const [entries, summary] = await Promise.all([
      listFinanceEntries(),
      getFinanceSummary(),
    ]);

    return noStoreJson({ entries, summary });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    const user = await requireAdmin();
    rateLimit(`finance:${user.id}`, 40, 60_000);

    const body = parseWith(financeEntrySchema, await readJson(request));
    const entry = await prisma.financeEntry.create({
      data: {
        type: body.type,
        category: body.category.trim(),
        description: body.description.trim(),
        amount: body.amount,
        occurredAt: new Date(`${body.occurredAt}T00:00:00.000Z`),
        createdById: user.id,
      },
    });

    return noStoreJson(
      {
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
      },
      201,
    );
  } catch (error) {
    return apiError(error);
  }
}
