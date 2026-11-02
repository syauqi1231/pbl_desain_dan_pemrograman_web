import { TryOnStudio } from "@/components/try-on/try-on-studio";
import { requirePageUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";

export const metadata = {
  title: "AI Virtual Try-On",
  robots: { index: false, follow: false },
};

export default async function TryOnPage({
  searchParams,
}: {
  searchParams: Promise<{ produk?: string }>;
}) {
  const { produk } = await searchParams;
  const nextPath = produk
    ? `/try-on?produk=${encodeURIComponent(produk)}`
    : "/try-on";

  const user = await requirePageUser(nextPath);
  const catalog = await getCatalog();
  const garments = catalog.filter(
    (product) => Boolean(product.image) && Boolean(product.tryOnPhotoType),
  );

  return (
    <TryOnStudio
      initialSlug={produk ?? garments[0]?.slug ?? ""}
      garments={garments}
      userName={user.name}
    />
  );
}
