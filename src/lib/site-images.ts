import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { productImageExists } from "@/lib/storage";
import type { SiteImage } from "@/lib/types";

export const siteImageSlots = [
  {
    key: "hero",
    label: "Gambar utama beranda",
    description: "Tampil besar di bagian paling atas beranda.",
    fallback: "/hero-kebaya.jpg",
    fallbackAlt: "Model memakai kebaya dengan kain batik",
  },
  {
    key: "story",
    label: "Gambar cerita toko",
    description: "Tampil di bagian cerita, di bawah daftar produk.",
    fallback: "/artisan-batik.jpg",
    fallbackAlt: "Perajin sedang mengerjakan kain batik",
  },
] as const;

export type SiteImageKey = (typeof siteImageSlots)[number]["key"];

const slotByKey = new Map(siteImageSlots.map((slot) => [slot.key, slot]));

export function isSiteImageKey(value: string): value is SiteImageKey {
  return slotByKey.has(value as SiteImageKey);
}

function usableImage(image: string | null): string | null {
  if (!image) return null;
  if (image.startsWith("/api/product-image/")) {
    return productImageExists(image) ? image : null;
  }
  if (!image.startsWith("/")) return null;

  return existsSync(join(process.cwd(), "public", image.slice(1)))
    ? image
    : null;
}

export const getSiteImages = cache(async (): Promise<SiteImage[]> => {
  const rows = await prisma.siteImage.findMany({
    where: { key: { in: siteImageSlots.map((slot) => slot.key) } },
  });
  const saved = new Map(rows.map((row) => [row.key, row]));

  return siteImageSlots.map((slot) => {
    const row = saved.get(slot.key);
    return {
      key: slot.key,
      label: slot.label,
      description: slot.description,
      image: usableImage(row?.image ?? null) ?? slot.fallback,
      imageAlt: row?.imageAlt?.trim() || slot.fallbackAlt,
    };
  });
});

export async function getSiteImage(key: SiteImageKey): Promise<SiteImage> {
  const images = await getSiteImages();
  return images.find((item) => item.key === key) ?? images[0];
}

export function siteImageKeyFrom(value: string): SiteImageKey | null {
  return isSiteImageKey(value) ? value : null;
}
