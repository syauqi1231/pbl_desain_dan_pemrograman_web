import type { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  assertSameOrigin,
  noStoreJson,
  parseWith,
  readJson,
  requireAdmin,
} from "@/lib/api-helpers";
import { mapProduct, productWithVariants } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { toProductData } from "@/lib/product-input";
import { productSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  try {
    await requireAdmin();
    assertSameOrigin(request);
    const { id } = await params;

    const body = parseWith(productSchema, await readJson(request));
    const current = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!current) throw new ApiError(404, "Produk tidak ditemukan.");

    const duplicate = await prisma.product.findFirst({
      where: { slug: body.slug, id: { not: id } },
      select: { id: true },
    });
    if (duplicate) {
      throw new ApiError(409, "Slug produk sudah dipakai. Pilih slug lain.");
    }

    const data = toProductData(body);
    const { variants, ...rest } = data;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          ...rest,
          variants: { create: variants.create },
        },
        include: productWithVariants,
      });
    });

    return noStoreJson({ product: mapProduct(updated) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  try {
    await requireAdmin();
    assertSameOrigin(request);
    const { id } = await params;

    const updated = await prisma.product.updateMany({
      where: { id },
      data: { active: false },
    });

    if (updated.count !== 1) {
      throw new ApiError(404, "Produk tidak ditemukan.");
    }

    return noStoreJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
