"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

type ProfileUser = {
  name: string;
  email: string;
  phone: string | null;
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
};

type FieldErrors = Record<string, string | undefined>;

export function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [addressLine, setAddressLine] = useState(user.addressLine ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [postalCode, setPostalCode] = useState(user.postalCode ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function clearAddress() {
    setAddressLine("");
    setCity("");
    setPostalCode("");
    setNotice("Alamat dikosongkan. Tekan Simpan profil untuk menerapkan.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const local: FieldErrors = {};
    if (name.trim().length < 2) local.name = "Nama minimal 2 karakter.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      local.email = "Masukkan alamat email yang valid.";
    }
    if (phone.trim() && !/^[0-9+\-\s()]{8,20}$/.test(phone.trim())) {
      local.phone = "Masukkan nomor telepon yang valid.";
    }
    if (postalCode.trim() && !/^[0-9]{5}$/.test(postalCode.trim())) {
      local.postalCode = "Kode pos terdiri dari 5 angka.";
    }

    setErrors(local);
    setNotice(null);
    setError(null);
    if (Object.keys(local).length > 0) return;

    setBusy(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          addressLine: addressLine.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        details?: Record<string, string[] | undefined>;
      };

      if (!response.ok) {
        const details = data.details ?? {};
        const mapped: FieldErrors = {};
        for (const key of ["name", "email", "phone", "addressLine", "city", "postalCode"]) {
          if (details[key]?.[0]) mapped[key] = details[key][0];
        }
        setErrors(mapped);
        setError(data.error ?? "Profil tidak bisa disimpan.");
        return;
      }

      setNotice("Profil berhasil disimpan.");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nama"
          value={name}
          onChange={setName}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Field
          label="Nomor telepon"
          type="tel"
          value={phone}
          onChange={setPhone}
          error={errors.phone}
          autoComplete="tel"
          hint="Opsional. Dipakai untuk mengisi checkout."
        />
      </div>

      <div className="border-t border-line pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Alamat pengiriman</h2>
            <p className="mt-1 text-sm text-espresso-500">
              Disimpan untuk mengisi checkout berikutnya.
            </p>
          </div>
          <Button type="button" variant="quiet" onClick={clearAddress}>
            Kosongkan alamat
          </Button>
        </div>

        <div className="mt-4 space-y-5">
          <Field
            label="Alamat"
            value={addressLine}
            onChange={setAddressLine}
            error={errors.addressLine}
            autoComplete="street-address"
            hint="Jalan, nomor rumah, RT/RW, kelurahan."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Kota / kabupaten"
              value={city}
              onChange={setCity}
              error={errors.city}
              autoComplete="address-level2"
            />
            <Field
              label="Kode pos"
              value={postalCode}
              onChange={setPostalCode}
              error={errors.postalCode}
              autoComplete="postal-code"
            />
          </div>
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-2xl border border-sage-700 bg-ivory-50 p-4 text-sm text-sage-700"
        >
          {notice}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-clay-500 bg-clay-50 p-4 text-sm text-clay-600"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Menyimpan..." : "Simpan profil"}
      </Button>
    </form>
  );
}
