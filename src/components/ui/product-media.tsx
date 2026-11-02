import Image from "next/image";
import type { Product } from "@/lib/types";

const tones = {
  200: "bg-sand-200",
  300: "bg-sand-300",
  400: "bg-sand-400",
  500: "bg-sand-500",
} as const;

export function ProductMedia({
  product,
  className = "",
  showLabel = true,
  radius = "rounded-[var(--radius-card)]",
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
}: {
  product: Product;
  className?: string;
  showLabel?: boolean;
  radius?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const tone = tones[(product.tone as keyof typeof tones) ?? 300] ?? tones[300];

  return (
    <div
      className={`relative flex items-end overflow-hidden ${radius} ${tone} ${className}`.trim()}
    >
      {product.image ? (
        <Image
          src={product.image}
          alt={product.imageAlt ?? product.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : showLabel ? (
        <span className="relative z-10 p-4 text-xs text-espresso-900">
          Foto belum tersedia
        </span>
      ) : null}
    </div>
  );
}
