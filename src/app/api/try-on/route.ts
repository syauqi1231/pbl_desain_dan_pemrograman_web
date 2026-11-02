import type { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  assertSameOrigin,
  noStoreJson,
  rateLimit,
  requireUser,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { saveBuffer } from "@/lib/storage";
import {
  fashnCategory,
  isFashnPhotoType,
  runTryOn,
  TryOnProviderError,
} from "@/lib/tryon";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export const maxDuration = 120;

function providerFailure(error: unknown): ApiError {
  if (error instanceof TryOnProviderError) {
    if (error.code === "timeout") {
      return new ApiError(
        504,
        "Antrean GPU FASHN terlalu lama. Coba lagi beberapa menit lagi.",
      );
    }
    if (error.code === "rate-limit") {
      return new ApiError(
        429,
        "Kuota gratis FASHN atau Hugging Face sedang penuh. Coba lagi nanti.",
      );
    }
    if (error.code === "rejected") {
      return new ApiError(
        422,
        "FASHN tidak bisa memproses foto atau pakaian ini. Coba foto lain yang seluruh badan terlihat.",
      );
    }
    return new ApiError(
      503,
      "Layanan FASHN sedang tidak tersedia atau baru bangun dari mode tidur. Coba lagi.",
    );
  }

  return new ApiError(
    502,
    "Try-on gagal diproses. Coba foto lain atau beberapa saat lagi.",
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    rateLimit(`try-on:${user.id}`, 10, 60_000);

    const form = await request.formData();
    const photo = form.get("photo");
    const slug = String(form.get("productSlug") ?? "").trim();

    if (!(photo instanceof File) || photo.size === 0) {
      throw new ApiError(400, "Unggah foto kamu dulu.");
    }
    if (!ALLOWED_MIME.has(photo.type)) {
      throw new ApiError(400, "Format foto harus JPG, PNG, atau WEBP.");
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      throw new ApiError(413, "Ukuran foto melebihi 8 MB.");
    }
    if (!slug) {
      throw new ApiError(400, "Pilih pakaian yang ingin dicoba.");
    }

    const product = await prisma.product.findFirst({
      where: { slug, active: true },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        tryOnCategory: true,
        tryOnPhotoType: true,
      },
    });

    if (!product) {
      throw new ApiError(404, "Produk try-on tidak ditemukan.");
    }
    if (!product.image) {
      throw new ApiError(400, "Produk ini belum punya foto untuk try-on.");
    }

    const category = fashnCategory(product.tryOnCategory);
    if (!category) {
      throw new ApiError(
        400,
        "Kategori produk ini belum didukung FASHN VTON v1.5.",
      );
    }
    if (!isFashnPhotoType(product.tryOnPhotoType)) {
      throw new ApiError(
        400,
        "Produk ini belum disiapkan untuk try-on. Pilih produk lain.",
      );
    }

    // The customer photo is deliberately not written to disk. It only lives in
    // memory for the duration of this request.
    const job = await prisma.tryOnJob.create({
      data: {
        userId: user.id,
        productId: product.id,
        provider: "fashn",
        status: "PROCESSING",
      },
      select: { id: true },
    });

    try {
      const outcome = await runTryOn({
        photo,
        garmentImage: product.image,
        category,
        photoType: product.tryOnPhotoType,
      });

      const extension = outcome.mime.includes("png")
        ? "png"
        : outcome.mime.includes("webp")
          ? "webp"
          : "jpg";
      const resultPath = await saveBuffer(outcome.buffer, "results", extension);
      const note =
        "Hasil dibuat oleh FASHN VTON v1.5 di Hugging Face. Periksa proporsi, warna, dan detail kain sebelum memesan.";

      await prisma.tryOnJob.update({
        where: { id: job.id },
        data: {
          status: "DONE",
          provider: "fashn",
          resultPath,
          note,
        },
      });

      return noStoreJson({
        job: {
          id: job.id,
          provider: "fashn",
          note,
          imageUrl: `/api/try-on/${job.id}/image`,
        },
      });
    } catch (error) {
      const code =
        error instanceof TryOnProviderError ? error.code : "unknown";

      console.error(
        `[try-on] job ${job.id} failed: ${code}`,
        error instanceof Error ? error.message : "",
      );

      await prisma.tryOnJob
        .update({
          where: { id: job.id },
          data: { status: "FAILED", error: code.slice(0, 100) },
        })
        .catch(() => {});

      throw providerFailure(error);
    }
  } catch (error) {
    return apiError(error);
  }
}
