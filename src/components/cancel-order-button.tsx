"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Pesanan tidak bisa dibatalkan. Coba lagi.");
        return;
      }

      setAsking(false);
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
          className="w-full sm:w-auto"
        >
          Batalkan pesanan
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
      <p className="text-sm font-medium">Batalkan pesanan ini?</p>
      <p className="mt-1 text-xs text-espresso-500">
        Stok akan dikembalikan ke katalog.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={cancel} disabled={busy}>
          {busy ? "Membatalkan..." : "Ya, batalkan"}
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
