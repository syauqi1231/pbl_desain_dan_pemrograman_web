import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-signout";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdminPage("/admin");

  return (
    <div className="min-h-dvh bg-ivory-100 lg:flex">
      <aside className="hidden w-[240px] shrink-0 flex-col bg-espresso-900 px-4 py-8 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <Link
          href="/admin"
          className="px-3 font-display text-lg leading-tight text-ivory-50 uppercase"
        >
          [Nama
          <br />
          Boutique]
        </Link>

        <Suspense fallback={<div className="mt-10 h-40" />}>
          <AdminNav variant="sidebar" />
        </Suspense>

        <div className="mt-auto space-y-1">
          <p className="px-3 pb-2 text-xs text-ivory-200/60">{user.email}</p>
          <Link
            href="/"
            className="flex min-h-11 items-center rounded-xl px-3 text-sm text-ivory-200/80 transition-colors hover:bg-white/5 hover:text-ivory-50 focus-visible:outline-sand-200"
          >
            Lihat toko
          </Link>
          <AdminSignOut />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4 border-b border-line bg-ivory-100 px-5 py-4 lg:hidden">
          <Link href="/admin" className="font-display text-base uppercase">
            [Nama Boutique]
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center px-2 text-sm text-espresso-500 hover:text-clay-500"
            >
              Lihat toko
            </Link>
            <AdminSignOut variant="light" />
          </div>
        </div>

        <Suspense fallback={<div className="h-14 border-b border-line" />}>
          <AdminNav variant="mobile" />
        </Suspense>

        <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
