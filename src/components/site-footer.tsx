import Link from "next/link";

const links = [
  { href: "/#koleksi", label: "Koleksi" },
  { href: "/?kategori=baru#koleksi", label: "Baru" },
  { href: "/?kategori=batik#koleksi", label: "Batik" },
  { href: "/?kategori=kebaya#koleksi", label: "Kebaya" },
  { href: "/try-on", label: "AI Try-On" },
  { href: "/chat", label: "Chat" },
  { href: "/kredit", label: "Kredit foto" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-12 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <p className="font-display text-2xl uppercase">[Nama Boutique]</p>
          <p className="mt-2 max-w-sm text-sm text-espresso-500">
            Kebaya, batik, dan tenun pilihan. Dijahit rapi.
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-clay-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 pb-10 text-xs text-espresso-500 sm:px-8 lg:px-10">
        <p>
          © {new Date().getFullYear()} Nama Boutique. Data produk pada demo ini
          adalah contoh.
        </p>
      </div>
    </footer>
  );
}
