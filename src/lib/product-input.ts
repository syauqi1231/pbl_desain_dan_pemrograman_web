import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prismaCollection } from "@/lib/catalog";
import type { productSchema } from "@/lib/validation";

type ProductInput = z.infer<typeof productSchema>;

export function toProductData(
  body: ProductInput,
): Omit<Prisma.ProductCreateInput, "variants"> & {
  variants: { create: { size: string; stock: number; sortOrder: number }[] };
} {
  return {
    slug: body.slug,
    name: body.name,
    description: body.description,
    material: body.material,
    price: body.price,
    collections: body.collections.map(prismaCollection),
    productType: body.productType === "couple" ? "COUPLE" : "SINGLE",
    bestSeller: body.bestSeller,
    isNew: body.isNew,
    tone: body.tone,
    image: body.image?.trim() || null,
    imageAlt: body.imageAlt?.trim() || null,
    tryOnCategory: body.tryOnCategory,
    tryOnPhotoType: body.tryOnPhotoType ?? null,
    active: body.active,
    variants: {
      create: body.variants.map((variant, index) => ({
        size: variant.size,
        stock: variant.stock,
        sortOrder: index,
      })),
    },
  };
}
