"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Keeps the admin order list current while a customer checks out. */
export function AdminAutoRefresh({ intervalMs = 20_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, router]);

  return null;
}
