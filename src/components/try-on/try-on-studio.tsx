"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductMedia } from "@/components/ui/product-media";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/label";
import { requestTryOn, type TryOnJob } from "@/lib/api";
import type { Product } from "@/lib/types";

const MAX_BYTES = 8 * 1024 * 1024;

type Status = "idle" | "processing" | "done";

export function TryOnStudio({
  initialSlug,
  garments,
  userName,
  realProvider,
}: {
  initialSlug: string;
  garments: Product[];
  userName: string;
  realProvider: boolean;
}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [garment, setGarment] = useState(
    garments.some((item) => item.slug === initialSlug)
      ? initialSlug
      : (garments[0]?.slug ?? ""),
  );
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<TryOnJob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedGarment = garments.find((item) => item.slug === garment);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function acceptFile(file: File | undefined) {
    setError(null);
    setJob(null);
    setStatus("idle");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG atau PNG).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ukuran foto melebihi 8 MB. Coba foto lain.");
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function run() {
    if (!photo) {
      setError("Unggah foto dulu sebelum mencoba.");
      return;
    }

    setError(null);
    setStatus("processing");
    try {
      const result = await requestTryOn({ photo, productSlug: garment });
      setJob(result);
      setStatus("done");
    } catch (cause) {
      setStatus("idle");
      setError(
        cause instanceof Error
          ? cause.message
          : "Try-on gagal. Coba lagi sebentar.",
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-14">
      <header className="flex items-center justify-between px-5 pt-6 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg uppercase tracking-[0.01em]"
        >
          [Nama Boutique]
        </Link>
        <Link
          href="/akun"
          aria-label="Buka akun saya"
          className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm"
        >
          {userName.split(" ")[0]}
        </Link>
      </header>

      <div className="px-5 pt-8 sm:px-8">
        <p className="text-sm text-espresso-500">
          Halo, {userName.split(" ")[0]}
        </p>
        <h1 className="mt-1 font-display text-4xl leading-tight sm:text-5xl">
          AI Virtual Try-On
        </h1>

        <div className="mt-6 rounded-[var(--radius-card)] bg-ivory-50 p-4 sm:p-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              acceptFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              acceptFile(event.dataTransfer.files?.[0]);
            }}
            className="rounded-2xl border border-dashed border-sand-500 p-3"
          >
            {preview ? (
              <div className="relative overflow-hidden rounded-xl bg-sand-200">
                <img
                  src={preview}
                  alt="Foto yang kamu unggah"
                  className="max-h-[420px] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPreview(null);
                    setJob(null);
                    setStatus("idle");
                  }}
                  className="absolute top-2 right-2 inline-flex min-h-11 items-center rounded-full bg-ivory-50/95 px-4 text-xs font-medium"
                >
                  Ganti foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[240px] w-full flex-col items-center justify-center rounded-xl px-6 py-10 text-center"
              >
                <span className="text-lg font-medium">Unggah foto kamu</span>
                <span className="mt-1 text-sm text-espresso-500">
                  Foto seluruh badan, berdiri lurus.
                </span>
              </button>
            )}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-13 items-center justify-center rounded-full bg-espresso-900 px-6 text-sm font-medium text-ivory-50 transition-colors hover:bg-espresso-700"
            >
              Pilih foto
            </button>
            <label className="inline-flex min-h-13 cursor-pointer items-center justify-center rounded-full border border-line bg-ivory-50 px-6 text-sm font-medium transition-colors hover:border-espresso-700 focus-within:outline-2 focus-within:outline-clay-500 focus-within:outline-offset-2">
              Ambil foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(event) => {
                  acceptFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium">Pilih pakaian</legend>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {garments.map((item) => {
              const selected = garment === item.slug;
              return (
                <label key={item.slug} className="block cursor-pointer rounded-2xl focus-within:outline-2 focus-within:outline-clay-500 focus-within:outline-offset-2">
                  <input
                    type="radio"
                    name="pakaian"
                    value={item.slug}
                    checked={selected}
                    onChange={() => setGarment(item.slug)}
                    className="sr-only"
                  />
                  <span
                    className={`block rounded-2xl border-2 p-1 transition-colors ${
                      selected ? "border-clay-500" : "border-transparent"
                    }`}
                  >
                    <ProductMedia
                      product={item}
                      showLabel={false}
                      radius="rounded-xl"
                      className="aspect-[3/4]"
                    />
                  </span>
                  <span className="mt-2 block text-xs leading-snug">
                    {item.name}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8 rounded-[var(--radius-card)] bg-ivory-50 p-4">
          {status === "done" && job ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {job.imageUrl ? (
                <div className="relative w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
                  <img
                    src={job.imageUrl}
                    alt={`Hasil try-on ${selectedGarment?.name ?? "pakaian pilihan"}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
              ) : preview ? (
                <div className="relative w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
                  <img
                    src={preview}
                    alt="Pratinjau foto asli, belum ada hasil try-on"
                    className="aspect-[3/4] w-full object-cover opacity-80"
                  />
                  <span className="absolute inset-x-2 bottom-2 rounded-full bg-espresso-900/90 px-2 py-1 text-center text-[10px] font-semibold tracking-[0.12em] text-ivory-50 uppercase">
                    Stub
                  </span>
                </div>
              ) : null}
              <div>
                <p className="font-medium">
                  {job.provider === "fal"
                    ? "Hasil try-on"
                    : "Belum ada hasil try-on"}
                </p>
                <p className="mt-1 text-sm text-espresso-500">{job.note}</p>
                <button
                  type="button"
                  onClick={run}
                  className="mt-3 min-h-11 text-sm underline underline-offset-4 hover:text-clay-500"
                >
                  Jalankan lagi
                </button>
              </div>
            </div>
          ) : status === "processing" ? (
            <div className="flex items-center gap-4 py-2">
              <span
                aria-hidden="true"
                className="size-6 animate-spin rounded-full border-2 border-line border-t-clay-500"
              />
              <div>
                <p className="font-medium">Menyiapkan hasil try-on</p>
                <p role="status" className="text-sm text-espresso-500">
                  Biasanya butuh beberapa detik.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="size-16 shrink-0 rounded-xl bg-sand-200" />
              <p className="text-sm text-espresso-500">
                Hasil try-on akan muncul di sini setelah kamu memilih foto dan
                pakaian.
              </p>
            </div>
          )}
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-clay-500 bg-clay-50 p-4 text-sm text-clay-600"
          >
            {error}
          </p>
        ) : null}

        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={run}
          disabled={status === "processing"}
        >
          {status === "processing" ? "Memproses..." : "Jalankan try-on"}
        </Button>

        <div className="mt-6">
          <SectionLabel>Catatan</SectionLabel>
          <p className="mt-2 text-xs leading-relaxed text-espresso-500">
            {realProvider
              ? "Hasil dibuat oleh fal.ai IDM-VTON. Periksa proporsi, warna, dan detail kain sebelum memesan."
              : "FAL_KEY belum diset, jadi try-on berjalan dalam mode demo. Foto tidak dikirim ke provider mana pun dan tidak ada hasil sungguhan."}
          </p>
        </div>
      </div>
    </div>
  );
}
