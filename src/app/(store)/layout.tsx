import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, catalog] = await Promise.all([getCurrentUser(), getCatalog()]);

  return (
    <CartProvider catalog={catalog}>
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
