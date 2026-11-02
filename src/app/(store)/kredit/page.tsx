import Link from "next/link";
import { SectionLabel } from "@/components/ui/label";

const photos = [
  {
    file: "hero-kebaya.jpg",
    title: "Kebaya Nusantara",
    artist: "Dudygr",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kebaya_Nusantara.jpg",
  },
  {
    file: "products/kebaya-encim-modern.jpg",
    title: "Kebaya Encim Betawi 20240622 121405",
    artist: "Naval Scene",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kebaya_Encim_Betawi_20240622_121405.jpg",
  },
  {
    file: "products/batik-kawung-selendang.jpg",
    title: "Batik pattern - kawung",
    artist: "Alteaven",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Batik_pattern_-_kawung.jpg",
  },
  {
    file: "products/lurik-linen-set.jpg",
    title: "Kain Tenun Lombok (Woven Fabric of Lombok)",
    artist: "Meithyra Melviana Simatupang",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kain_Tenun_Lombok_(Woven_Fabric_of_Lombok).jpg",
  },
  {
    file: "products/kebaya-kutubaru.jpg",
    title: "Kebaya merah pengantin wanita",
    artist: "Sokokuphoto",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kebaya_merah_pengantin_wanita.jpg",
  },
  {
    file: "products/blouse-tenun-sumba.jpg",
    title: "Kain Tenun Pagatan 180825002",
    artist: "Ezagren",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kain_Tenun_Pagatan_180825002.JPG",
  },
  {
    file: "products/batik-tulis-parang.jpg",
    title: "Kain Batik Lasem motif Parang, Dewa Ruci",
    artist: "Candramawa99",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kain_Batik_Lasem_motif_Parang,_Dewa_Ruci.jpg",
  },
  {
    file: "products/outer-tenun-ikat.jpg",
    title: "Kain Tenun Suku Sabu 01",
    artist: "EdwinJulio1995",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kain_Tenun_Suku_Sabu_01.jpg",
  },
  {
    file: "products/kebaya-brokat.jpg",
    title:
      "Kain & Kebaya Indonesia, Honolulu Museum of Art 10067.1, 14469.1",
    artist: "Hiart",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:Kain_%26_Kebaya_Indonesia,_Honolulu_Museum_of_Art_10067.1,_14469.1.jpg",
  },
  {
    file: "artisan-batik.jpg",
    title: "Batik Tulis",
    artist: "Gunawan Kartapranata",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Batik_Tulis.jpg",
  },
];

export const metadata = { title: "Kredit foto" };

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 pt-10 pb-24 sm:px-8 lg:px-10">
      <SectionLabel>Kredit</SectionLabel>
      <h1 className="mt-3 font-display text-[clamp(2rem,3.4vw,3rem)] leading-tight">
        Kredit foto
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-espresso-500">
        Foto produk di demo ini berasal dari Wikimedia Commons. Setiap foto
        sudah dipotong dan diperkecil agar sesuai kartu produk. Lisensi dan
        tautan sumbernya ada di bawah.
      </p>

      <ul className="mt-8 space-y-4">
        {photos.map((photo) => (
          <li
            key={photo.file}
            className="rounded-2xl border border-line bg-ivory-50 p-5"
          >
            <p className="font-medium">{photo.title}</p>
            <p className="mt-1 text-sm text-espresso-500">
              Foto oleh {photo.artist}. Lisensi{" "}
              <a
                href={photo.licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-clay-500"
              >
                {photo.license}
              </a>
              .
            </p>
            <p className="mt-2 text-xs text-espresso-500">{photo.file}</p>
            <a
              href={photo.source}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-clay-500"
            >
              Sumber di Wikimedia Commons
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-espresso-500">
        Kembali ke{" "}
        <Link
          href="/"
          className="text-espresso-900 underline underline-offset-4 hover:text-clay-500"
        >
          halaman toko
        </Link>
        .
      </p>
    </div>
  );
}
