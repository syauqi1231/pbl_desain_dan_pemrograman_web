"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { buttonStyles } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatIDR, lineKey } from "@/lib/format";
import { ProductMedia } from "@/components/ui/product-media";

export function CartDrawer() {
  const { isOpen, close, detailed, subtotal, setQty, remove, count } =
    useCart();

  return (
    <Dialog open={isOpen} onClose={close} label="Keranjang">
      <div className="ml-auto flex h-full w-full max-w-[440px] flex-col bg-ivory-50">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl">
            Keranjang{" "}
            <span className="text-base text-espresso-500">({count})</span>
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup keranjang"
            className="inline-flex size-11 items-center justify-center rounded-full border border-line text-xl leading-none"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {detailed.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="font-display text-2xl">Keranjang masih kosong</p>
            <p className="text-sm text-espresso-500">
              Pilih kebaya, batik, atau tenun dari koleksi kami.
            </p>
            <Link
              href="/#koleksi"
              onClick={close}
              className={buttonStyles({ variant: "secondary" })}
            >
              Lihat koleksi
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {detailed.map(({ line, product }) => {
                const key = lineKey(line.slug, line.size);
                return (
                  <li key={key} className="flex gap-4 py-5">
                    <ProductMedia
                      product={product}
                      showLabel={false}
                      radius="rounded-xl"
                      className="h-20 w-16 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-espresso-500">
                            Ukuran {line.size}
                          </p>
                        </div>
                        <p className="text-sm">
                          {formatIDR(product.price * line.qty)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Kurangi jumlah ${product.name}`}
                            onClick={() => setQty(key, line.qty - 1)}
                            className="inline-flex size-9 items-center justify-center rounded-full border border-line"
                          >
                            <span aria-hidden="true">−</span>
                          </button>
                          <span className="w-8 text-center text-sm">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`Tambah jumlah ${product.name}`}
                            onClick={() => setQty(key, line.qty + 1)}
                            className="inline-flex size-9 items-center justify-center rounded-full border border-line"
                          >
                            <span aria-hidden="true">+</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="text-xs text-espresso-500 underline underline-offset-4 hover:text-clay-500"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-4 border-t border-line px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-espresso-500">Subtotal</span>
                <span className="text-base font-medium">
                  {formatIDR(subtotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className={buttonStyles({ className: "w-full" })}
              >
                Checkout
              </Link>
              <p className="text-center text-xs text-espresso-500">
                Ongkir dan pembayaran dihitung di halaman checkout.
              </p>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
