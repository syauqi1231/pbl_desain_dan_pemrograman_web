"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  className = "",
  variant = "quiet",
  label = "Keluar",
}: {
  className?: string;
  variant?: "primary" | "secondary" | "quiet";
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
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
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={logout}
      disabled={busy}
    >
      {busy ? "Keluar..." : label}
    </Button>
  );
}
