import "server-only";

import { fal } from "@fal-ai/client";
import { readPublicImage } from "@/lib/storage";

export type TryOnOutcome =
  | { provider: "stub"; note: string }
  | { provider: "fal"; buffer: Buffer; mime: string };

const STUB_NOTE =
  "Mode demo: FAL_KEY belum diset, jadi belum ada gambar try-on sungguhan. Foto tidak dikirim ke provider mana pun.";

export function hasFalKey(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

function mimeForPath(path: string): string {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function runTryOn(input: {
  photo: File;
  productName: string;
  productDescription: string;
  garmentImage: string | null;
}): Promise<TryOnOutcome> {
  const key = process.env.FAL_KEY?.trim();

  if (!key) {
    return { provider: "stub", note: STUB_NOTE };
  }

  if (!input.garmentImage) {
    throw new Error("Produk ini belum punya foto yang bisa dipakai try-on.");
  }

  fal.config({ credentials: key });

  const photoBuffer = Buffer.from(await input.photo.arrayBuffer());
  const garmentBuffer = await readPublicImage(input.garmentImage);

  const [humanUrl, garmentUrl] = await Promise.all([
    fal.storage.upload(
      new Blob([Uint8Array.from(photoBuffer)], {
        type: input.photo.type || "image/jpeg",
      }),
      { lifecycle: { expiresIn: "1h" } },
    ),
    fal.storage.upload(
      new Blob([Uint8Array.from(garmentBuffer)], {
        type: mimeForPath(input.garmentImage),
      }),
      { lifecycle: { expiresIn: "1h" } },
    ),
  ]);

  const result = await fal.subscribe("fal-ai/idm-vton", {
    input: {
      human_image_url: humanUrl,
      garment_image_url: garmentUrl,
      description: `${input.productName}. ${input.productDescription}`.slice(
        0,
        300,
      ),
    },
    logs: false,
  });

  const imageUrl = (
    result.data as { image?: { url?: string } } | undefined
  )?.image?.url;

  if (!imageUrl) {
    throw new Error("Provider tidak mengembalikan gambar try-on.");
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("Gagal mengunduh hasil try-on dari provider.");
  }

  return {
    provider: "fal",
    buffer: Buffer.from(await response.arrayBuffer()),
    mime: response.headers.get("content-type") ?? "image/jpeg",
  };
}
