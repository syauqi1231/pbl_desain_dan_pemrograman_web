import Link from "next/link";
import { notFound } from "next/navigation";
import { DeactivateProductButton } from "@/components/admin/deactivate-product-button";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/auth";
import { getAdminProductById } from "@/lib/catalog";

export const metadata = { title: "Edit produk" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminPage(`/admin/produk/${id}`);
  const product = await getAdminProductById(id);

  if (!product) notFound();

  return (
    <div>
      <nav aria-label="Remah roti" className="text-sm text-espresso-500">
        <Link href="/admin?view=produk" className="hover:text-clay-500">
          Produk
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-espresso-900">{product.name}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight">
            Edit {product.name}
          </h1>
          <p className="mt-2 text-sm text-espresso-500">
            {product.active
              ? "Produk aktif dan tampil di toko."
              : "Produk tidak aktif dan tidak tampil di toko."}
          </p>
        </div>
        {product.active ? (
          <DeactivateProductButton productId={product.id} />
        ) : null}
      </div>

      <div className="mt-6">
        <ProductForm mode="edit" product={product} />
      </div>
    </div>
  );
}
