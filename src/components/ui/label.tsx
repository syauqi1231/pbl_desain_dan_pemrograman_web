import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.14em] text-clay-500 uppercase">
      {children}
    </p>
  );
}
