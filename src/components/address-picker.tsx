"use client";

import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  addressQuery,
  osmEmbedUrl,
  osmLinkUrl,
  type MapPlace,
} from "@/lib/maps";

type FieldErrors = {
  addressLine?: string;
  city?: string;
  postalCode?: string;
  addressNote?: string;
};

export function AddressPicker({
  address,
  city = "",
  postalCode = "",
  note,
  onAddressChange,
  onCityChange,
  onPostalCodeChange,
  onNoteChange,
  errors = {},
  showNote = true,
}: {
  address: string;
  city?: string;
  postalCode?: string;
  note: string;
  onAddressChange: (value: string) => void;
  onCityChange?: (value: string) => void;
  onPostalCodeChange?: (value: string) => void;
  onNoteChange: (value: string) => void;
  errors?: FieldErrors;
  showNote?: boolean;
}) {
  const [place, setPlace] = useState<MapPlace | null>(null);
  const [searching, setSearching] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  function changeAddress(value: string) {
    setPlace(null);
    setMapError(null);
    onAddressChange(value);
  }

  function changeCity(value: string) {
    setPlace(null);
    setMapError(null);
    onCityChange?.(value);
  }

  function changePostalCode(value: string) {
    setPlace(null);
    setMapError(null);
    onPostalCodeChange?.(value);
  }

  async function showMap() {
    const query = addressQuery(address, city, postalCode);
    if (!query) {
      setMapError("Tulis alamat dulu, lalu cari di peta.");
      return;
    }

    setSearching(true);
    setMapError(null);
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`,
      );
      const data = (await response.json().catch(() => ({}))) as {
        place?: MapPlace;
        error?: string;
      };

      if (!response.ok || !data.place) {
        setMapError(data.error ?? "Alamat tidak ditemukan. Coba lagi.");
        return;
      }

      setPlace(data.place);
    } catch {
      setMapError("Peta tidak bisa dihubungi. Periksa koneksi lalu coba lagi.");
    } finally {
      setSearching(false);
    }
  }

  function handleAddressKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      showMap();
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Alamat pengiriman</h2>
          <p className="mt-1 text-sm text-espresso-500">
            Cari alamatmu di peta, lalu lengkapi detailnya.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={showMap}
          disabled={searching}
        >
          {searching ? "Mencari..." : "Cari di peta"}
        </Button>
      </div>

      <Field
        label="Alamat lengkap"
        value={address}
        onChange={changeAddress}
        onKeyDown={handleAddressKeyDown}
        error={errors.addressLine}
        hint="Jalan, nomor rumah, RT/RW, kelurahan. Tekan Enter untuk melihat peta."
        autoComplete="street-address"
        required
      />

      {onCityChange || onPostalCodeChange ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {onCityChange ? (
            <Field
              label="Kota / kabupaten"
              value={city}
              onChange={changeCity}
              error={errors.city}
              autoComplete="address-level2"
            />
          ) : null}
          {onPostalCodeChange ? (
            <Field
              label="Kode pos"
              value={postalCode}
              onChange={changePostalCode}
              error={errors.postalCode}
              autoComplete="postal-code"
            />
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-ivory-100">
        {place ? (
          <iframe
            title="Peta alamat dari OpenStreetMap"
            src={osmEmbedUrl(place.lat, place.lon)}
            className="h-64 w-full border-0 sm:h-72"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-8 text-clay-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <p className="mt-3 text-sm font-medium">Peta alamat</p>
            <p className="mt-1 max-w-xs text-xs text-espresso-500">
              Isi alamat lengkap, lalu tekan Cari di peta untuk melihat
              lokasinya.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-ivory-50 px-4 py-3">
          <p className="max-w-md text-xs text-espresso-500">
            {place
              ? place.displayName
              : "Alamat tetap kamu isi sendiri. Peta hanya membantu menemukan titik rumah."}
          </p>
          {place ? (
            <a
              href={osmLinkUrl(place.lat, place.lon)}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline underline-offset-4 hover:text-clay-500"
            >
              Buka peta besar
            </a>
          ) : null}
        </div>
      </div>
      {mapError ? (
        <p role="alert" className="text-xs text-clay-600">
          {mapError}
        </p>
      ) : null}

      {showNote ? (
        <Field
          label="Deskripsi alamat (opsional)"
          value={note}
          onChange={onNoteChange}
          error={errors.addressNote}
          hint="Patokan atau detail tambahan untuk kurir."
        />
      ) : null}
    </div>
  );
}
