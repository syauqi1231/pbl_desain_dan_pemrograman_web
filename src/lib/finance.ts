import "server-only";

import { prisma } from "@/lib/db";
import type { FinanceEntryView, FinanceSummary } from "@/lib/types";

const VERIFIED_ORDER_STATUSES = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
] as const;

export async function listFinanceEntries(): Promise<FinanceEntryView[]> {
  const rows = await prisma.financeEntry.findMany({
    include: { createdBy: { select: { name: true } } },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    take: 500,
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    category: row.category,
    description: row.description,
    amount: row.amount,
    occurredAt: row.occurredAt.toISOString(),
    createdByName: row.createdBy?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const [income, expense, entryCount, orderRevenue, orderCount] =
    await Promise.all([
      prisma.financeEntry.aggregate({
        _sum: { amount: true },
        where: { type: "INCOME" },
      }),
      prisma.financeEntry.aggregate({
        _sum: { amount: true },
        where: { type: "EXPENSE" },
      }),
      prisma.financeEntry.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: [...VERIFIED_ORDER_STATUSES] } },
      }),
      prisma.order.count({
        where: { status: { in: [...VERIFIED_ORDER_STATUSES] } },
      }),
    ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;

  return {
    income: totalIncome,
    expense: totalExpense,
    balance: totalIncome - totalExpense,
    orderRevenue: orderRevenue._sum.total ?? 0,
    orderCount,
    entryCount,
  };
}
