import { TryOnStudio } from "@/components/try-on/try-on-studio";
import { requirePageUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { hasFalKey } from "@/lib/tryon";

export const metadata = { title: "AI Virtual Try-On" };

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
  const garments = catalog.filter((product) => Boolean(product.image));

  return (
    <TryOnStudio
      initialSlug={produk ?? garments[0]?.slug ?? ""}
      garments={garments}
      userName={user.name}
      realProvider={hasFalKey()}
    />
  );
}
