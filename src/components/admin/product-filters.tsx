import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

const priceRanges = [
  { value: "", label: "Semua harga" },
  { value: "0-500000", label: "Di bawah Rp 500.000" },
  { value: "500000-1000000", label: "Rp 500.000 sampai Rp 1.000.000" },
  { value: "1000000-2000000", label: "Rp 1.000.000 sampai Rp 2.000.000" },
  { value: "2000000-999999999", label: "Di atas Rp 2.000.000" },
] as const;

export function ProductFilters({
  sizes,
  current,
  resultCount,
  hasFilter,
}: {
  sizes: string[];
  current: {
    ukuran: string;
    tipe: string;
    harga: string;
    terbaik: string;
    baru: string;
  };
  resultCount: number;
  hasFilter: boolean;
}) {
  return (
    <form
      method="get"
      action="/admin"
      className="rounded-3xl border border-line bg-ivory-50 p-4 sm:p-5"
    >
      <input type="hidden" name="view" value="produk" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="block">
          <span className="text-xs font-medium text-espresso-500">Ukuran</span>
          <select
            name="ukuran"
            defaultValue={current.ukuran}
            className="mt-1.5 min-h-11 w-full rounded-full border border-line bg-ivory-50 px-4 text-sm"
          >
            <option value="">Semua ukuran</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-espresso-500">
            Kategori
          </span>
          <select
            name="tipe"
            defaultValue={current.tipe}
            className="mt-1.5 min-h-11 w-full rounded-full border border-line bg-ivory-50 px-4 text-sm"
          >
            <option value="">Semua kategori</option>
            <option value="single">Single</option>
            <option value="couple">Couple</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-espresso-500">Harga</span>
          <select
            name="harga"
            defaultValue={current.harga}
            className="mt-1.5 min-h-11 w-full rounded-full border border-line bg-ivory-50 px-4 text-sm"
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-espresso-500">
            Produk terbaik
          </span>
          <select
            name="terbaik"
            defaultValue={current.terbaik}
            className="mt-1.5 min-h-11 w-full rounded-full border border-line bg-ivory-50 px-4 text-sm"
          >
            <option value="">Semua produk</option>
            <option value="1">Hanya produk terbaik</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-espresso-500">
            Produk baru
          </span>
          <select
            name="baru"
            defaultValue={current.baru}
            className="mt-1.5 min-h-11 w-full rounded-full border border-line bg-ivory-50 px-4 text-sm"
          >
            <option value="">Semua produk</option>
            <option value="1">Hanya produk baru</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-espresso-500">
          {resultCount} produk ditampilkan
          {hasFilter ? " sesuai filter." : "."}
        </p>
        <div className="flex flex-wrap gap-2">
          {hasFilter ? (
            <Link
              href="/admin?view=produk"
              className={buttonStyles({ variant: "quiet" })}
            >
              Reset filter
            </Link>
          ) : null}
          <button
            type="submit"
            className={buttonStyles({ variant: "primary" })}
          >
            Terapkan filter
          </button>
        </div>
      </div>
    </form>
  );
}
