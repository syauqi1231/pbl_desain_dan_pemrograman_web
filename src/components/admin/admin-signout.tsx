"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminSignOut({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className={`inline-flex min-h-11 items-center rounded-xl px-3 text-sm transition-colors disabled:opacity-50 ${
        variant === "dark"
          ? "text-ivory-200/80 hover:bg-white/5 hover:text-ivory-50"
          : "text-espresso-500 hover:text-clay-500"
      }`}
    >
      {busy ? "Keluar..." : "Keluar"}
    </button>
  );
}
