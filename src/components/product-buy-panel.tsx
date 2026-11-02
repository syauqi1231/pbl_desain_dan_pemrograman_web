"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function BuyPanel({ product }: { product: Product }) {
  const { add, open } = useCart();
  const firstAvailable =
    product.sizes.find((size) => (product.stockBySize[size] ?? 0) > 0) ??
    product.sizes[0] ??
    "";
  const [size, setSize] = useState(firstAvailable);
  const [qty, setQty] = useState(1);

  const stock = product.stockBySize[size] ?? 0;
  const soldOut = product.sizes.every(
    (option) => (product.stockBySize[option] ?? 0) <= 0,
  );

  return (
    <div className="mt-8 space-y-6">
      <fieldset>
        <legend className="text-sm font-medium">Ukuran</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((option) => {
            const optionStock = product.stockBySize[option] ?? 0;
            const unavailable = optionStock <= 0;
            return (
              <label
                key={option}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 text-sm transition-colors focus-within:outline-2 focus-within:outline-clay-500 focus-within:outline-offset-2 ${
                  size === option
                    ? "border-clay-500 bg-clay-500 text-white"
                    : "border-line bg-ivory-50 hover:border-espresso-700"
                } ${unavailable ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="ukuran"
                  value={option}
                  checked={size === option}
                  disabled={unavailable}
                  onChange={() => {
                    setSize(option);
                    setQty(1);
                  }}
                  className="sr-only"
                />
                {option}
                {unavailable ? (
                  <span className="ml-1 text-xs">(habis)</span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <p className="text-sm font-medium">Jumlah</p>
        <div className="mt-3 flex items-center gap-1">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            disabled={qty <= 1}
            onClick={() => setQty((current) => Math.max(1, current - 1))}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line disabled:opacity-40"
          >
            <span aria-hidden="true">−</span>
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            disabled={qty >= Math.min(stock, 99)}
            onClick={() =>
              setQty((current) => Math.min(current + 1, Math.min(stock, 99)))
            }
            className="inline-flex size-11 items-center justify-center rounded-full border border-line disabled:opacity-40"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-espresso-500">
          {soldOut
            ? "Stok sedang habis."
            : stock > 0
              ? `Tersisa ${stock} untuk ukuran ${size}.`
              : "Pilih ukuran yang masih tersedia."}
        </p>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={soldOut || stock <= 0}
        onClick={() => {
          add(product.slug, size, qty);
          open();
        }}
      >
        {soldOut ? "Stok habis" : "Tambah ke keranjang"}
      </Button>
    </div>
  );
}
