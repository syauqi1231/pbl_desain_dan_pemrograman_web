import Link from "next/link";
import { StatusText } from "@/components/ui/status";
import { formatDate, formatIDR } from "@/lib/format";
import type { OrderSummary } from "@/lib/types";

export function AdminOrdersTable({
  orders,
  showDate = true,
}: {
  orders: OrderSummary[];
  showDate?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-ivory-100 p-6 text-sm text-espresso-500">
        Belum ada pesanan. Pesanan baru akan muncul di sini.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-espresso-500">
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pr-4 font-medium">
                Nomor
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Pelanggan
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Item
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Total
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Status
              </th>
              <th
                scope="col"
                className={`py-3 font-medium ${showDate ? "hidden xl:table-cell" : "hidden"}`}
              >
                Tanggal
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0">
                <td className="py-4 pr-4">
                  <Link
                    href={`/admin/pesanan/${order.id}`}
                    className="font-medium underline-offset-4 hover:text-clay-500 hover:underline"
                  >
                    {order.number}
                  </Link>
                </td>
                <td className="py-4 pr-4">
                  <p>{order.customerName ?? "[Nama pelanggan]"}</p>
                  {order.customerEmail ? (
                    <p className="text-xs text-espresso-500">
                      {order.customerEmail}
                    </p>
                  ) : null}
                </td>
                <td className="py-4 pr-4">{order.firstItemName}</td>
                <td className="py-4 pr-4">{formatIDR(order.total)}</td>
                <td className="py-4 pr-4">
                  <StatusText status={order.status} />
                </td>
                <td
                  className={`py-4 text-espresso-500 ${showDate ? "hidden xl:table-cell" : "hidden"}`}
                >
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/admin/pesanan/${order.id}`}
              className="flex items-start justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{order.number}</p>
                <p className="mt-1 text-sm">{order.firstItemName}</p>
                <p className="text-xs text-espresso-500">
                  {order.customerName ?? "[Nama pelanggan]"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <StatusText status={order.status} />
                <p className="mt-1 text-sm">{formatIDR(order.total)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
