"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { SiteImage } from "@/lib/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function SlotCard({ slot }: { slot: SiteImage }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;

    setError(null);
    setNotice(null);
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setError("Foto harus JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Ukuran foto melebihi 5 MB.");
      return;
    }

    const body = new FormData();
    body.set("key", slot.key);
    body.set("image", file);

    setBusy(true);
    try {
      const response = await fetch("/api/admin/site-images", {
        method: "POST",
        body,
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Gambar tidak bisa diunggah.");
        return;
      }
      setNotice("Gambar berhasil diganti.");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function resetImage() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const response = await fetch("/api/admin/site-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: slot.key }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Gambar tidak bisa dikembalikan.");
        return;
      }
      setNotice("Gambar bawaan dipakai lagi.");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-ivory-50">
      <div className="relative aspect-[16/10] bg-sand-200">
        <Image
          src={slot.image}
          alt={slot.imageAlt ?? slot.label}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <h2 className="font-display text-xl">{slot.label}</h2>
        <p className="mt-1 text-sm text-espresso-500">{slot.description}</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? "Menyimpan..." : "Ganti gambar"}
          </Button>
          <Button
            type="button"
            variant="quiet"
            onClick={resetImage}
            disabled={busy}
          >
            Pakai gambar bawaan
          </Button>
        </div>

        <p className="mt-3 text-xs text-espresso-500">
          JPG, PNG, atau WEBP. Maksimal 5 MB. Sebaiknya pakai foto lanskap
          supaya tidak terpotong.
        </p>
        {notice ? (
          <p role="status" className="mt-2 text-xs text-sage-700">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-2 text-xs text-clay-600">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function SiteImageManager({ images }: { images: SiteImage[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {images.map((slot) => (
        <SlotCard key={slot.key} slot={slot} />
      ))}
    </div>
  );
}
