"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 5 * 1024 * 1024;

export function OrderProofUpload({
  orderId,
  canUpload,
  proofName,
}: {
  orderId: string;
  canUpload: boolean;
  proofName: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];

    setError(null);
    setNotice(null);

    if (!file) {
      setError("Pilih file bukti pembayaran dulu.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Bukti harus berupa gambar JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ukuran file melebihi 5 MB.");
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.set("proof", file);

      const response = await fetch(`/api/orders/${orderId}/proof`, {
        method: "POST",
        body: form,
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Bukti tidak bisa diunggah. Coba lagi.");
        return;
      }

      setNotice("Bukti pembayaran terkirim. Admin akan memeriksanya.");
      setPickedName(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h3 className="font-display text-xl">Bukti pembayaran</h3>

      {proofName ? (
        <p className="mt-3 text-sm text-espresso-500">
          File terunggah:{" "}
          <a
            href={`/api/orders/${orderId}/proof`}
            target="_blank"
            rel="noreferrer"
            className="text-espresso-900 underline underline-offset-4 hover:text-clay-500"
          >
            {proofName}
          </a>
        </p>
      ) : (
        <p className="mt-3 text-sm text-espresso-500">
          Belum ada bukti yang diunggah.
        </p>
      )}

      {canUpload ? (
        <form onSubmit={submit} className="mt-4">
          <p id={`proof-help-${orderId}`} className="text-sm font-medium">
            Unggah bukti transfer
          </p>
          <input
            ref={inputRef}
            id={`proof-${orderId}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-describedby={`proof-help-${orderId}`}
            onChange={(event) => {
              setPickedName(event.target.files?.[0]?.name ?? null);
              setError(null);
              setNotice(null);
            }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Pilih gambar
            </Button>
            <p
              role="status"
              className="min-w-0 truncate text-xs text-espresso-500"
            >
              {pickedName ?? "Belum ada file dipilih."}
            </p>
          </div>
          <p className="mt-2 text-xs text-espresso-500">
            JPG, PNG, atau WEBP. Maksimal 5 MB.
          </p>
          <Button
            type="submit"
            className="mt-3"
            disabled={busy || !pickedName}
          >
            {busy ? "Mengunggah..." : "Kirim bukti"}
          </Button>
        </form>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-clay-600">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-3 text-sm text-sage-700">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
