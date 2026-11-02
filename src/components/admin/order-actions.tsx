"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/types";

type Action = "verify" | "reject" | "process" | "ship" | "complete" | "cancel";

const actionLabels: Record<Action, string> = {
  verify: "Verifikasi pembayaran",
  reject: "Tolak bukti",
  process: "Mulai proses",
  ship: "Tandai dikirim",
  complete: "Tandai selesai",
  cancel: "Batalkan pesanan",
};

const actionVariants: Record<Action, "primary" | "secondary" | "quiet"> = {
  verify: "primary",
  reject: "quiet",
  process: "primary",
  ship: "primary",
  complete: "primary",
  cancel: "quiet",
};

function actionsFor(status: OrderStatus): Action[] {
  switch (status) {
    case "PENDING_PAYMENT":
      return ["cancel"];
    case "AWAITING_VERIFICATION":
      return ["verify", "reject", "cancel"];
    case "PAID":
      return ["process", "cancel"];
    case "PROCESSING":
      return ["ship", "cancel"];
    case "SHIPPED":
      return ["complete"];
    default:
      return [];
  }
}

export function AdminOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const actions = actionsFor(status);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<Action | null>(null);
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(action: Action) {
    setBusy(action);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note.trim() || undefined }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Status pesanan tidak bisa diubah.");
        return;
      }

      setConfirming(null);
      setNote("");
      setNotice(`Tindakan "${actionLabels[action]}" berhasil.`);
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  if (actions.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-ivory-100 p-4 text-sm text-espresso-500">
        Tidak ada tindakan untuk status pesanan ini.
      </p>
    );
  }

  return (
    <div>
      <label htmlFor={`catatan-admin-${orderId}`} className="block text-sm font-medium">
        Catatan admin (opsional)
      </label>
      <textarea
        id={`catatan-admin-${orderId}`}
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="mt-2 w-full resize-y rounded-2xl border border-line bg-ivory-50 px-5 py-3 text-sm"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => {
          const destructive = action === "cancel" || action === "reject";
          if (destructive && confirming === action) {
            return (
              <span
                key={action}
                className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-ivory-100 p-2"
              >
                <span className="px-2 text-sm">Yakin?</span>
                <Button
                  type="button"
                  variant={action === "cancel" ? "primary" : "quiet"}
                  onClick={() => run(action)}
                  disabled={busy !== null}
                >
                  {busy === action ? "Memproses..." : `Ya, ${actionLabels[action].toLowerCase()}`}
                </Button>
                <Button
                  type="button"
                  variant="quiet"
                  onClick={() => setConfirming(null)}
                  disabled={busy !== null}
                >
                  Tidak
                </Button>
              </span>
            );
          }

          return (
            <Button
              key={action}
              type="button"
              variant={actionVariants[action]}
              onClick={() =>
                destructive ? setConfirming(action) : run(action)
              }
              disabled={busy !== null}
            >
              {busy === action ? "Memproses..." : actionLabels[action]}
            </Button>
          );
        })}
      </div>

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
