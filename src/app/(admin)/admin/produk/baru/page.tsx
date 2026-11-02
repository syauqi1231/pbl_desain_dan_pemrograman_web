import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/auth";

export const metadata = { title: "Upload produk" };

export default async function NewProductPage() {
  await requireAdminPage("/admin/produk/baru");

  return (
    <div>
      <nav aria-label="Remah roti" className="text-sm text-espresso-500">
        <Link href="/admin?view=produk" className="hover:text-clay-500">
          Produk
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-espresso-900">Upload produk</span>
      </nav>

      <h1 className="mt-3 font-display text-4xl leading-tight">
        Upload produk
      </h1>
      <p className="mt-2 max-w-xl text-sm text-espresso-500">
        Produk disimpan ke database dan langsung tampil di toko bila statusnya
        aktif.
      </p>

      <div className="mt-6">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
