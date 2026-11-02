import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyPanel } from "@/components/product-buy-panel";
import { buttonStyles } from "@/components/ui/button";
import { ProductMedia } from "@/components/ui/product-media";
import { getProductBySlug } from "@/lib/catalog";
import { formatIDR } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? product.name : "Produk tidak ditemukan" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-8 pb-20 sm:px-8 lg:px-10 lg:pt-12">
      <nav aria-label="Remah roti" className="text-sm text-espresso-500">
        <Link href="/" className="hover:text-clay-500">
          Koleksi
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-espresso-900">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductMedia
          product={product}
          className="aspect-[4/5]"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold tracking-[0.14em] text-clay-500 uppercase">
            {product.material}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,3.4vw,3rem)] leading-tight">
            {product.name}
          </h1>
          <p className="mt-4 text-xl">{formatIDR(product.price)}</p>
          <p className="mt-6 max-w-lg leading-relaxed text-espresso-500">
            {product.description}
          </p>

          <BuyPanel product={product} />

          <Link
            href={`/try-on?produk=${product.slug}`}
            className={buttonStyles({
              variant: "secondary",
              className: "mt-3 w-full",
            })}
          >
            Coba dulu dengan AI Try-On
          </Link>

          <dl className="mt-10 space-y-3 border-t border-line pt-6 text-sm">
            <div className="flex justify-between gap-6">
              <dt className="text-espresso-500">Bahan</dt>
              <dd className="text-right">{product.material}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-espresso-500">Ukuran tersedia</dt>
              <dd className="text-right">{product.sizes.join(", ")}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-espresso-500">Pengiriman</dt>
              <dd className="text-right">
                Rp 25.000, gratis di atas Rp 1.000.000
              </dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-espresso-500">Pembayaran</dt>
              <dd className="text-right">QRIS atau transfer bank (demo)</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
