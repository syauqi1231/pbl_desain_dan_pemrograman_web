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
import { getCatalog, mapProduct, productWithVariants } from "@/lib/catalog";
import { isCollection } from "@/lib/collections";
import { prisma } from "@/lib/db";
import { toProductData } from "@/lib/product-input";
import { productSchema } from "@/lib/validation";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const kategori = url.searchParams.get("kategori");
    const products = await getCatalog();

    if (!kategori || kategori === "semua" || !isCollection(kategori)) {
      return noStoreJson({ products });
    }

    return noStoreJson({
      products: products.filter((product) =>
        product.collections.includes(kategori),
      ),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin();
    assertSameOrigin(request);

    const body = parseWith(productSchema, await readJson(request));
    const existing = await prisma.product.findUnique({
      where: { slug: body.slug },
      select: { id: true },
    });

    if (existing) {
      throw new ApiError(409, "Slug produk sudah dipakai. Pilih slug lain.");
    }

    const data = toProductData(body);
    const created = await prisma.product.create({
      data,
      include: productWithVariants,
    });

    return noStoreJson({ product: mapProduct(created) }, 201);
  } catch (error) {
    return apiError(error);
  }
}
