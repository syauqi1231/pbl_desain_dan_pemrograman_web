"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeactivateProductButton({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deactivate() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Produk tidak bisa dinonaktifkan.");
        return;
      }

      router.push("/admin?view=produk");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (!asking) {
    return (
      <div>
        <Button
          type="button"
          variant="quiet"
          onClick={() => setAsking(true)}
        >
          Nonaktifkan produk
        </Button>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-clay-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-ivory-50 p-4">
      <p className="text-sm font-medium">Nonaktifkan produk ini?</p>
      <p className="mt-1 text-xs text-espresso-500">
        Produk tidak dihapus, hanya disembunyikan dari toko.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={deactivate} disabled={busy}>
          {busy ? "Menonaktifkan..." : "Ya, nonaktifkan"}
        </Button>
        <Button
          type="button"
          variant="quiet"
          onClick={() => setAsking(false)}
          disabled={busy}
        >
          Tidak
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-clay-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
