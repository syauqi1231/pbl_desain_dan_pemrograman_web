import Link from "next/link";
import { AdminOrdersTable } from "@/components/admin/orders-table";
import { buttonStyles } from "@/components/ui/button";
import { ProductMedia } from "@/components/ui/product-media";
import { SampleTag } from "@/components/ui/status";
import { requireAdminPage } from "@/lib/auth";
import { getAdminCatalog } from "@/lib/catalog";
import { formatIDR } from "@/lib/format";
import { getAdminOrders, getAdminStats } from "@/lib/order-queries";
import { chatThreads, unansweredCount } from "@/lib/mock/inbox";

const views = ["ringkasan", "pesanan", "produk", "chat"] as const;
type ViewId = (typeof views)[number];

const titles: Record<ViewId, string> = {
  ringkasan: "Ringkasan Toko",
  pesanan: "Pesanan",
  produk: "Produk",
  chat: "Chat",
};

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl bg-ivory-50 p-5">
      <p className="text-sm text-espresso-500">{label}</p>
      <p className="mt-2 text-xl font-semibold break-words tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-espresso-500">{hint}</p>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireAdminPage("/admin");
  const params = await searchParams;
  const active: ViewId = views.includes(params.view as ViewId)
    ? (params.view as ViewId)
    : "ringkasan";

  const [stats, orders, products] = await Promise.all([
    getAdminStats(),
    getAdminOrders(),
    getAdminCatalog(),
  ]);

  return (
    <>
      <p className="text-sm text-espresso-500">
        Selamat datang, {user.name.split(" ")[0]}
      </p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl leading-tight">{titles[active]}</h1>
        <div className="flex flex-wrap gap-3">
          {active === "produk" ? (
            <Link
              href="/admin/produk/baru"
              className={buttonStyles({ variant: "primary" })}
            >
              + Upload Produk
            </Link>
          ) : (
            <Link
              href="/admin?view=pesanan"
              className={buttonStyles({ variant: "secondary" })}
            >
              Lihat pesanan
            </Link>
          )}
        </div>
      </div>

      {active === "ringkasan" ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="Pendapatan bulan ini"
              value={formatIDR(stats.revenue)}
              hint="Pesanan terverifikasi"
            />
            <Kpi
              label="Menunggu verifikasi"
              value={String(stats.awaitingVerification)}
              hint="Bukti pembayaran perlu dicek"
            />
            <Kpi
              label="Produk aktif"
              value={String(stats.activeProducts)}
              hint="Tampil di toko"
            />
            <Kpi
              label="Pesanan terbuka"
              value={String(stats.openOrders)}
              hint="Belum selesai atau batal"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[2.2fr_0.8fr]">
            <section className="min-w-0 rounded-3xl bg-ivory-50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl">Pesanan terbaru</h2>
                <Link
                  href="/admin?view=pesanan"
                  className="text-sm underline underline-offset-4 hover:text-clay-500"
                >
                  Semua
                </Link>
              </div>
              <div className="mt-4">
                <AdminOrdersTable orders={orders.slice(0, 5)} showDate={false} />
              </div>
            </section>

            <section className="flex min-w-0 flex-col rounded-3xl bg-ivory-50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl">Chat</h2>
                <SampleTag />
              </div>
              <p className="mt-2 text-xs text-espresso-500">
                Chat masih demo lokal, belum tersambung ke backend.
              </p>
              <ul className="mt-4 space-y-3">
                {chatThreads.map((thread) => (
                  <li key={thread.id}>
                    <Link
                      href="/chat"
                      className="block rounded-2xl bg-ivory-100 p-4 transition-colors hover:bg-ivory-200"
                    >
                      <p className="text-sm font-medium">{thread.name}</p>
                      <p className="mt-1 truncate text-sm text-espresso-500">
                        {thread.preview}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin?view=chat"
                className={buttonStyles({
                  variant: "quiet",
                  className: "mt-auto w-full",
                })}
              >
                Buka chat demo
              </Link>
            </section>
          </div>
        </>
      ) : null}

      {active === "pesanan" ? (
        <section className="mt-6 rounded-3xl bg-ivory-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">Semua pesanan</h2>
            <p className="text-xs text-espresso-500">
              {orders.length} pesanan, terbaru di atas
            </p>
          </div>
          <div className="mt-4">
            <AdminOrdersTable orders={orders} />
          </div>
        </section>
      ) : null}

      {active === "produk" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const stock = Object.values(product.stockBySize).reduce(
              (total, value) => total + value,
              0,
            );

            return (
              <Link
                key={product.id}
                href={`/admin/produk/${product.id}`}
                className="flex gap-4 rounded-3xl bg-ivory-50 p-4 transition-colors hover:bg-ivory-200"
              >
                <ProductMedia
                  product={product}
                  showLabel={false}
                  radius="rounded-xl"
                  className="h-24 w-20 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight">
                    {product.name}
                  </p>
                  <p className="mt-1 text-sm text-espresso-500">
                    {formatIDR(product.price)}
                  </p>
                  <p
                    className={`mt-2 text-xs ${
                      product.active ? "text-sage-700" : "text-clay-600"
                    }`}
                  >
                    {product.active ? "Aktif di toko" : "Tidak aktif"}
                  </p>
                  <p className="mt-1 text-xs text-espresso-500">
                    Total stok {stock}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}

      {active === "chat" ? (
        <section className="mt-6 rounded-3xl bg-ivory-50 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl">Percakapan demo</h2>
            <SampleTag />
          </div>
          <p className="mt-2 text-sm text-espresso-500">
            Ada {unansweredCount()} pesan belum dibalas di data contoh. Chat
            belum tersambung ke backend, jadi balasan hanya tersimpan di
            perangkat ini.
          </p>
          <ul className="mt-4 divide-y divide-line">
            {chatThreads.map((thread) => (
              <li key={thread.id}>
                <Link
                  href="/chat"
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-clay-500"
                >
                  <span>
                    <span className="block text-sm font-medium">
                      {thread.name}
                    </span>
                    <span className="mt-1 block text-sm text-espresso-500">
                      {thread.preview}
                    </span>
                  </span>
                  {thread.unread > 0 ? (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-clay-500 px-2 py-0.5 text-xs text-white">
                      {thread.unread}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
