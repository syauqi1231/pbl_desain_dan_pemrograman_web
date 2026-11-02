import type { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  assertSameOrigin,
  noStoreJson,
  requireUser,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { saveBuffer, saveUpload } from "@/lib/storage";
import { hasFalKey, runTryOn } from "@/lib/tryon";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export const maxDuration = 60;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    assertSameOrigin(request);
    const user = await requireUser();

    const form = await request.formData();
    const photo = form.get("photo");
    const slug = String(form.get("productSlug") ?? "").trim();

    if (!(photo instanceof File)) {
      throw new ApiError(400, "Unggah foto kamu dulu.");
    }
    if (!photo.type.startsWith("image/")) {
      throw new ApiError(400, "File harus berupa gambar JPG, PNG, atau WEBP.");
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
      },
    });

    if (!product) {
      throw new ApiError(404, "Produk try-on tidak ditemukan.");
    }

    let photoPath: string;
    try {
      const saved = await saveUpload(photo, "tryon", MAX_PHOTO_BYTES);
      photoPath = saved.path;
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error ? error.message : "Foto tidak bisa dibaca.",
      );
    }

    const job = await prisma.tryOnJob.create({
      data: {
        userId: user.id,
        productId: product.id,
        provider: hasFalKey() ? "fal" : "stub",
        status: "PROCESSING",
        photoPath,
      },
      select: { id: true },
    });

    try {
      const outcome = await runTryOn({
        photo,
        productName: product.name,
        productDescription: product.description,
        garmentImage: product.image,
      });

      if (outcome.provider === "stub") {
        await prisma.tryOnJob.update({
          where: { id: job.id },
          data: {
            status: "DONE",
            provider: "stub",
            note: outcome.note,
          },
        });

        return noStoreJson({
          job: {
            id: job.id,
            provider: "stub",
            note: outcome.note,
            imageUrl: null,
          },
        });
      }

      const extension = outcome.mime.includes("png")
        ? "png"
        : outcome.mime.includes("webp")
          ? "webp"
          : "jpg";
      const resultPath = await saveBuffer(outcome.buffer, "results", extension);
      const note =
        "Hasil dibuat oleh fal.ai IDM-VTON. Periksa proporsi, warna, dan detail kain sebelum memesan.";

      await prisma.tryOnJob.update({
        where: { id: job.id },
        data: {
          status: "DONE",
          provider: "fal",
          resultPath,
          note,
        },
      });

      return noStoreJson({
        job: {
          id: job.id,
          provider: "fal",
          note,
          imageUrl: `/api/try-on/${job.id}/image`,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Provider try-on gagal memproses foto.";

      await prisma.tryOnJob.update({
        where: { id: job.id },
        data: { status: "FAILED", error: message.slice(0, 500) },
      });

      throw new ApiError(
        502,
        "Try-on gagal diproses. Coba foto lain atau beberapa saat lagi.",
      );
    }
  } catch (error) {
    return apiError(error);
  }
}
