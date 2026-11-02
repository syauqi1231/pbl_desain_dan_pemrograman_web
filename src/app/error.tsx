"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-1 flex-col items-start justify-center px-5 py-24">
      <p className="text-xs font-semibold tracking-[0.14em] text-clay-500 uppercase">
        Terjadi kesalahan
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight">
        Halaman gagal dimuat
      </h1>
      <p className="mt-3 text-espresso-500">
        Coba muat ulang. Kalau tetap gagal, kembali ke koleksi.
      </p>
      <Button className="mt-8" onClick={reset}>
        Coba lagi
      </Button>
      {error.digest ? (
        <p className="mt-6 text-xs text-espresso-500">
          Kode kesalahan: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
