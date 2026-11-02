import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-1 flex-col items-start justify-center px-5 py-24">
      <p className="text-xs font-semibold tracking-[0.14em] text-clay-500 uppercase">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 text-espresso-500">
        Alamat ini tidak ada, atau produknya sudah tidak dijual.
      </p>
      <Link href="/" className={buttonStyles({ className: "mt-8" })}>
        Kembali ke koleksi
      </Link>
    </div>
  );
}
