import type { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  assertSameOrigin,
  noStoreJson,
  readJson,
  requireAdmin,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { siteImageSlots } from "@/lib/site-images";
import {
  deleteProductImage,
  saveProductImage,
} from "@/lib/storage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function slotFor(key: string) {
  const slot = siteImageSlots.find((item) => item.key === key);
  if (!slot) throw new ApiError(400, "Bagian gambar tidak dikenal.");
  return slot;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin();
    assertSameOrigin(request);

    const form = await request.formData();
    const key = String(form.get("key") ?? "");
    const file = form.get("image");
    const slot = slotFor(key);

    if (!(file instanceof File)) {
      throw new ApiError(400, "Pilih foto yang ingin diunggah.");
    }

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      throw new ApiError(400, "Foto harus JPG, PNG, atau WEBP.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new ApiError(400, "Ukuran foto melebihi 5 MB.");
    }

    const saved = await saveProductImage(file, MAX_IMAGE_BYTES);
    const previous = await prisma.siteImage.findUnique({
      where: { key },
      select: { image: true },
    });

    const updated = await prisma.siteImage.upsert({
      where: { key },
      create: {
        key,
        image: saved.url,
        imageAlt: slot.fallbackAlt,
      },
      update: {
        image: saved.url,
        imageAlt: slot.fallbackAlt,
      },
    });

    if (previous?.image && previous.image !== saved.url) {
      await deleteProductImage(previous.image);
    }

    return noStoreJson({
      image: {
        key: updated.key,
        image: updated.image,
        imageAlt: updated.imageAlt,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin();
    assertSameOrigin(request);

    const body = (await readJson(request)) as { key?: string };
    const key = String(body?.key ?? "");
    slotFor(key);

    const previous = await prisma.siteImage.findUnique({
      where: { key },
      select: { image: true },
    });

    if (previous) {
      await prisma.siteImage.delete({ where: { key } });
      await deleteProductImage(previous.image);
    }

    return noStoreJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
