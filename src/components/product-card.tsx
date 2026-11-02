import Link from "next/link";
import { formatIDR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductMedia } from "@/components/ui/product-media";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <div className="relative">
        <Link
          href={`/produk/${product.slug}`}
          className="block rounded-[var(--radius-card)] transition-shadow hover:ring-2 hover:ring-clay-500 hover:ring-offset-4 hover:ring-offset-ivory-100"
        >
          <ProductMedia product={product} className="aspect-[4/5]" />
        </Link>
        <Link
          href={`/try-on?produk=${product.slug}`}
          className="absolute top-3 left-3 inline-flex min-h-11 items-center rounded-full bg-clay-500 px-4 text-xs font-medium text-white transition-colors hover:bg-clay-600"
        >
          Coba Try-On
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h3 className="min-w-0 font-display text-lg leading-snug sm:text-xl">
          <Link href={`/produk/${product.slug}`} className="hover:text-clay-500">
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 text-sm">{formatIDR(product.price)}</p>
      </div>
      <p className="mt-1 text-sm text-espresso-500">{product.material}</p>
    </article>
  );
}
