import Link from "next/link";
import { SiteImageManager } from "@/components/admin/site-image-manager";
import { buttonStyles } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/auth";
import { getSiteImages } from "@/lib/site-images";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gambar situs" };

export default async function SiteImagesPage() {
  await requireAdminPage("/admin/gambar");
  const images = await getSiteImages();

  return (
    <>
      <p className="text-sm text-espresso-500">Tampilan toko</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight">Gambar situs</h1>
          <p className="mt-2 max-w-2xl text-sm text-espresso-500">
            Atur foto yang bergantian di beranda dan foto cerita toko. Foto
            produk diatur dari halaman produk.
          </p>
        </div>
        <Link
          href="/admin?view=produk"
          className={buttonStyles({ variant: "secondary" })}
        >
          Atur foto produk
        </Link>
      </div>

      <div className="mt-6">
        <SiteImageManager images={images} />
      </div>
    </>
  );
}
