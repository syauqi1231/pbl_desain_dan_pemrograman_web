import type { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  assertSameOrigin,
  noStoreJson,
  requireAdmin,
} from "@/lib/api-helpers";
import { saveProductImage } from "@/lib/storage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    await requireAdmin();

    const form = await request.formData();
    const image = form.get("image");

    if (!(image instanceof File) || image.size === 0) {
      throw new ApiError(400, "Pilih foto produk yang ingin diunggah.");
    }
    if (!ALLOWED_MIME.has(image.type)) {
      throw new ApiError(400, "Foto produk harus JPG, PNG, atau WEBP.");
    }
    if (image.size > MAX_IMAGE_BYTES) {
      throw new ApiError(413, "Ukuran foto produk melebihi 5 MB.");
    }

    const saved = await saveProductImage(image, MAX_IMAGE_BYTES);
    return noStoreJson({ image: saved.url }, 201);
  } catch (error) {
    return apiError(error);
  }
}
