import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { buttonStyles } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/label";
import { getCatalog, filterProducts } from "@/lib/catalog";
import { collections } from "@/lib/collections";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  const active =
    collections.find((item) => item.value === params.kategori) ??
    collections[0];
  const catalog = await getCatalog();
  const items = filterProducts(catalog, active.value);
  const isFiltered = active.value !== "semua";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nama Boutique",
    url: absoluteUrl("/"),
    description:
      "Kebaya, batik, dan tenun pilihan dengan AI Virtual Try-On.",
    inLanguage: "id-ID",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="mx-auto max-w-[1400px] px-5 pt-10 pb-16 sm:px-8 lg:px-10 lg:pt-16 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <SectionLabel>Koleksi musim ini</SectionLabel>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[0.98] tracking-[-0.02em]">
              Kebaya modern
              <br />
              untuk setiap hari
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-espresso-500">
              Kain tenun dan batik pilihan, dijahit rapi. Coba tampilannya di
              tubuhmu dengan AI Virtual Try-On sebelum memesan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#koleksi" className={buttonStyles({ size: "lg" })}>
                Lihat koleksi
              </Link>
              <Link
                href="/try-on"
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                Coba AI Try-On
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3.4] overflow-hidden rounded-[var(--radius-card)] bg-sand-200">
            <Image
              src="/hero-kebaya.jpg"
              alt="Model memakai kebaya dengan kain batik"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section
        id="koleksi"
        className="mx-auto max-w-[1400px] scroll-mt-24 px-5 sm:px-8 lg:px-10"
      >
        <div className="flex items-end justify-between gap-6 border-t border-line pt-10">
          <div>
            <SectionLabel>
              {isFiltered ? `Kategori ${active.label}` : "Pilihan toko"}
            </SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,3vw,2.75rem)] leading-tight">
              Koleksi Pilihan
            </h2>
          </div>
          {isFiltered ? (
            <Link
              href="/#koleksi"
              className="shrink-0 pb-2 text-sm underline underline-offset-4 transition-colors hover:text-clay-500"
            >
              Lihat semua
            </Link>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-card)] border border-line bg-ivory-50 px-8 py-16 text-center">
            <p className="font-display text-2xl">
              Belum ada produk di kategori ini
            </p>
            <p className="mt-2 text-sm text-espresso-500">
              Koleksi {active.label.toLowerCase()} sedang kosong.
            </p>
            <Link
              href="/#koleksi"
              className={buttonStyles({
                variant: "secondary",
                className: "mt-6",
              })}
            >
              Lihat semua koleksi
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
            {items.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
