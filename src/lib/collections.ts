import type { Collection } from "@/lib/types";

export const collections: { value: Collection | "semua"; label: string }[] = [
  { value: "semua", label: "Koleksi" },
  { value: "baru", label: "Baru" },
  { value: "batik", label: "Batik" },
  { value: "kebaya", label: "Kebaya" },
];

export function isCollection(value: string | undefined): value is Collection {
  return value === "baru" || value === "batik" || value === "kebaya";
}
