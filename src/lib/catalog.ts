import "server-only";

import type { Collection as PrismaCollection, Prisma } from "@prisma/client";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { isCollection } from "@/lib/collections";
import { prisma } from "@/lib/db";
import { productImageExists } from "@/lib/storage";
import type { Collection, Product, TryOnPhotoType } from "@/lib/types";

// A path can be stored before the file exists (or point at a file that was
// removed). Treat those as "no photo" so cards show the labelled placeholder
// and try-on does not offer a garment it cannot render.
function usableImage(image: string | null): string | null {
  if (!image) return null;
  if (/^https?:\/\//.test(image) || image.startsWith("data:")) return image;
  if (!image.startsWith("/")) return null;
  if (image.startsWith("/api/product-image/")) {
    return productImageExists(image) ? image : null;
  }

  return existsSync(join(process.cwd(), "public", image.slice(1)))
    ? image
    : null;
}

function usablePhotoType(value: string | null): TryOnPhotoType | null {
  return value === "model" || value === "flat-lay" ? value : null;
}

export const productWithVariants = {
  variants: {
    orderBy: { sortOrder: "asc" },
  },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{
  include: typeof productWithVariants;
}>;

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    collections: row.collections.map(
      (collection) => collection.toLowerCase() as Collection,
    ),
    price: row.price,
    tone: row.tone,
    image: usableImage(row.image),
    imageAlt: row.imageAlt,
    description: row.description,
    material: row.material,
    sizes: row.variants.map((variant) => variant.size),
    stockBySize: Object.fromEntries(
      row.variants.map((variant) => [variant.size, variant.stock]),
    ),
    tryOnCategory: row.tryOnCategory,
    tryOnPhotoType: usablePhotoType(row.tryOnPhotoType),
    active: row.active,
  };
}

export const getCatalog = cache(async (): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { active: true },
    include: productWithVariants,
    orderBy: { createdAt: "asc" },
  });

  return rows.map(mapProduct);
});

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const row = await prisma.product.findUnique({
      where: { slug },
      include: productWithVariants,
    });

    if (!row || !row.active) return null;
    return mapProduct(row);
  },
);

export const getAdminCatalog = cache(async (): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    include: productWithVariants,
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
  });

  return rows.map(mapProduct);
});

export const getAdminProductById = cache(
  async (id: string): Promise<Product | null> => {
    const row = await prisma.product.findUnique({
      where: { id },
      include: productWithVariants,
    });

    return row ? mapProduct(row) : null;
  },
);

export function filterProducts(
  products: Product[],
  kategori: string | undefined,
): Product[] {
  if (!kategori || kategori === "semua") return products;
  if (!isCollection(kategori)) return products;

  return products.filter((product) => product.collections.includes(kategori));
}

export function prismaCollection(value: string): PrismaCollection {
  return value.toUpperCase() as PrismaCollection;
}
