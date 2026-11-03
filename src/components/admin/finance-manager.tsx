"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { formatDate, formatIDR } from "@/lib/format";
import type {
  FinanceEntryView,
  FinanceSummary,
  FinanceType,
} from "@/lib/types";

type FormState = {
  type: FinanceType;
  category: string;
  description: string;
  amount: string;
  occurredAt: string;
};

type FieldErrors = Record<string, string | undefined>;
type LoadStatus = "loading" | "ready" | "error";

const MAX_AMOUNT = 2_000_000_000;

const categories: Record<FinanceType, string[]> = {
  INCOME: ["Penjualan", "Modal", "Pendapatan lain"],
  EXPENSE: ["Bahan", "Produksi", "Operasional", "Pemasaran", "Pengeluaran lain"],
};

function todayValue(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function emptyForm(): FormState {
  return {
    type: "INCOME",
    category: "",
    description: "",
    amount: "",
    occurredAt: todayValue(),
  };
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl bg-ivory-50 p-5">
      <p className="text-sm text-espresso-500">{label}</p>
      <p className="mt-2 text-xl font-semibold break-words tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-espresso-500">{hint}</p>
    </div>
  );
}

export function FinanceManager({
  initialEntries,
  initialSummary,
}: {
  initialEntries: FinanceEntryView[];
  initialSummary: FinanceSummary;
}) {
  const [entries, setEntries] = useState<FinanceEntryView[]>(initialEntries);
  const [summary, setSummary] = useState<FinanceSummary>(initialSummary);
  const [status, setStatus] = useState<LoadStatus>("ready");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const response = await fetch("/api/admin/finance", {
        headers: { Accept: "application/json" },
      });
      const data = (await response.json().catch(() => ({}))) as {
        entries?: FinanceEntryView[];
        summary?: FinanceSummary;
        error?: string;
      };

      if (!response.ok || !data.entries || !data.summary) {
        throw new Error(
          data.error ?? "Catatan keuangan tidak bisa dimuat. Coba lagi.",
        );
      }

      setEntries(data.entries);
      setSummary(data.summary);
      setStatus("ready");
    } catch (cause) {
      setLoadError(
        cause instanceof Error
          ? cause.message
          : "Catatan keuangan tidak bisa dimuat. Coba lagi.",
      );
      setStatus("error");
    }
  }

  function reload() {
    setStatus("loading");
    setLoadError(null);
    void load();
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setFieldErrors({});
  }

  function startEdit(entry: FinanceEntryView) {
    setEditingId(entry.id);
    setForm({
      type: entry.type,
      category: entry.category,
      description: entry.description,
      amount: String(entry.amount),
      occurredAt: entry.occurredAt.slice(0, 10),
    });
    setFieldErrors({});
    setNotice(null);
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const local: FieldErrors = {};
    if (form.category.trim().length < 2) {
      local.category = "Kategori minimal 2 karakter.";
    }
    if (form.description.trim().length < 3) {
      local.description = "Keterangan minimal 3 karakter.";
    }
    if (!/^\d+$/.test(form.amount.trim())) {
      local.amount = "Masukkan nominal dalam angka.";
    } else {
      const value = Number(form.amount);
      if (value < 1) local.amount = "Nominal minimal Rp 1.";
      if (value > MAX_AMOUNT) {
        local.amount = "Nominal maksimal Rp 2.000.000.000.";
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.occurredAt)) {
      local.occurredAt = "Pilih tanggal catatan.";
    }

    setFieldErrors(local);
    setNotice(null);
    setError(null);
    if (Object.keys(local).length > 0) return;

    setSaving(true);
    try {
      const endpoint = editingId
        ? `/api/admin/finance/${editingId}`
        : "/api/admin/finance";
      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          category: form.category.trim(),
          description: form.description.trim(),
          amount: Number(form.amount),
          occurredAt: form.occurredAt,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        details?: Record<string, string[] | undefined>;
      };

      if (!response.ok) {
        const details = data.details ?? {};
        const mapped: FieldErrors = {};
        for (const key of [
          "type",
          "category",
          "description",
          "amount",
          "occurredAt",
        ]) {
          if (details[key]?.[0]) mapped[key] = details[key][0];
        }
        setFieldErrors(mapped);
        setError(data.error ?? "Catatan tidak bisa disimpan. Coba lagi.");
        return;
      }

      const message = editingId
        ? "Catatan keuangan diperbarui."
        : "Catatan keuangan ditambahkan.";
      resetForm();
      await load();
      setNotice(message);
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/finance/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Catatan tidak bisa dihapus.");
      }

      setPendingDelete(null);
      if (editingId === id) resetForm();
      await load();
      setNotice("Catatan keuangan dihapus.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Catatan tidak bisa dihapus. Coba lagi.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {status === "loading" && !summary ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl bg-ivory-50 p-5"
            >
              <div className="h-3 w-24 rounded bg-sand-200" />
              <div className="mt-3 h-7 w-32 rounded bg-sand-200" />
              <div className="mt-2 h-3 w-28 rounded bg-sand-200" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Pemasukan manual"
            value={formatIDR(summary.income)}
            hint="Dari catatan yang tercatat di halaman ini."
          />
          <SummaryCard
            label="Pengeluaran manual"
            value={formatIDR(summary.expense)}
            hint="Dari catatan yang tercatat di halaman ini."
          />
          <SummaryCard
            label="Saldo catatan"
            value={formatIDR(summary.balance)}
            hint="Pemasukan dikurangi pengeluaran manual."
          />
          <SummaryCard
            label="Pendapatan pesanan"
            value={formatIDR(summary.orderRevenue)}
            hint={`${summary.orderCount} pesanan terverifikasi, dipisah agar tidak terhitung dua kali.`}
          />
        </div>
      ) : null}

      {status === "error" ? (
        <p
          role="alert"
          className="rounded-2xl border border-clay-500 bg-clay-50 p-4 text-sm text-clay-600"
        >
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div ref={formRef} className="scroll-mt-6">
          <section className="rounded-3xl bg-ivory-50 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">
                  {editingId ? "Ubah catatan" : "Catat transaksi"}
                </h2>
                <p className="mt-1 text-sm text-espresso-500">
                  {editingId
                    ? "Perbarui catatan lalu simpan."
                    : "Catat pemasukan atau pengeluaran manual di luar pesanan."}
                </p>
              </div>
              {editingId ? (
                <Button type="button" variant="quiet" onClick={resetForm}>
                  Batal
                </Button>
              ) : null}
            </div>

            <form onSubmit={submit} noValidate className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="keuangan-jenis"
                  className="block text-sm font-medium"
                >
                  Jenis
                </label>
                <select
                  id="keuangan-jenis"
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as FinanceType,
                      category: "",
                    }))
                  }
                  className="mt-2 min-h-11 w-full rounded-full border border-line bg-ivory-50 px-5 text-sm"
                >
                  <option value="INCOME">Pemasukan</option>
                  <option value="EXPENSE">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="keuangan-kategori"
                  className="block text-sm font-medium"
                >
                  Kategori
                </label>
                <input
                  id="keuangan-kategori"
                  value={form.category}
                  list="keuangan-kategori-pilihan"
                  aria-invalid={fieldErrors.category ? true : undefined}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className={`mt-2 min-h-11 w-full rounded-full border bg-ivory-50 px-5 text-sm ${
                    fieldErrors.category ? "border-clay-500" : "border-line"
                  }`}
                />
                <datalist id="keuangan-kategori-pilihan">
                  {categories[form.type].map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
                {fieldErrors.category ? (
                  <p className="mt-2 text-xs text-clay-600">
                    {fieldErrors.category}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="keuangan-keterangan"
                  className="block text-sm font-medium"
                >
                  Keterangan
                </label>
                <textarea
                  id="keuangan-keterangan"
                  rows={3}
                  value={form.description}
                  aria-invalid={fieldErrors.description ? true : undefined}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={`mt-2 w-full rounded-2xl border bg-ivory-50 px-5 py-3 text-sm ${
                    fieldErrors.description ? "border-clay-500" : "border-line"
                  }`}
                />
                {fieldErrors.description ? (
                  <p className="mt-2 text-xs text-clay-600">
                    {fieldErrors.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="keuangan-nominal"
                    className="block text-sm font-medium"
                  >
                    Nominal
                  </label>
                  <input
                    id="keuangan-nominal"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={form.amount}
                    aria-invalid={fieldErrors.amount ? true : undefined}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    className={`mt-2 min-h-11 w-full rounded-full border bg-ivory-50 px-5 text-sm tabular-nums ${
                      fieldErrors.amount ? "border-clay-500" : "border-line"
                    }`}
                  />
                  {fieldErrors.amount ? (
                    <p className="mt-2 text-xs text-clay-600">
                      {fieldErrors.amount}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="keuangan-tanggal"
                    className="block text-sm font-medium"
                  >
                    Tanggal
                  </label>
                  <input
                    id="keuangan-tanggal"
                    type="date"
                    value={form.occurredAt}
                    aria-invalid={fieldErrors.occurredAt ? true : undefined}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        occurredAt: event.target.value,
                      }))
                    }
                    className={`mt-2 min-h-11 w-full rounded-full border bg-ivory-50 px-5 text-sm ${
                      fieldErrors.occurredAt ? "border-clay-500" : "border-line"
                    }`}
                  />
                  {fieldErrors.occurredAt ? (
                    <p className="mt-2 text-xs text-clay-600">
                      {fieldErrors.occurredAt}
                    </p>
                  ) : null}
                </div>
              </div>

              {notice ? (
                <p
                  role="status"
                  className="rounded-2xl border border-sage-700 bg-ivory-100 p-3 text-sm text-sage-700"
                >
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p
                  role="alert"
                  className="rounded-2xl border border-clay-500 bg-clay-50 p-3 text-sm text-clay-600"
                >
                  {error}
                </p>
              ) : null}

              <Button type="submit" size="lg" className="w-full" disabled={saving}>
                {saving
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan perubahan"
                    : "Tambahkan catatan"}
              </Button>
            </form>

            <p className="mt-4 text-xs leading-relaxed text-espresso-500">
              Pendapatan pesanan terverifikasi ditampilkan terpisah dan tidak
              masuk ke saldo catatan manual.
            </p>
          </section>
        </div>

        <section
          aria-labelledby="daftar-keuangan"
          className="rounded-3xl bg-ivory-50 p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="daftar-keuangan" className="font-display text-xl">
                Daftar catatan
              </h2>
              <p className="mt-1 text-xs text-espresso-500">
                {summary
                  ? `${summary.entryCount} catatan, terbaru di atas.`
                  : "Memuat catatan keuangan."}
              </p>
            </div>
            <Button
              type="button"
              variant="quiet"
              onClick={reload}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Memuat..." : "Muat ulang"}
            </Button>
          </div>

          {status === "loading" ? (
            <ul className="mt-4 divide-y divide-line" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <li key={item} className="animate-pulse space-y-2 py-4">
                  <div className="h-4 w-36 rounded bg-sand-200" />
                  <div className="h-3 w-52 rounded bg-sand-200" />
                </li>
              ))}
            </ul>
          ) : null}

          {status === "error" ? (
            <div className="mt-4 rounded-2xl border border-clay-500 bg-clay-50 p-4">
              <p className="text-sm text-clay-600">{loadError}</p>
              <Button
                type="button"
                variant="quiet"
                className="mt-3"
                onClick={reload}
              >
                Coba lagi
              </Button>
            </div>
          ) : null}

          {status === "ready" && entries.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-sand-500 px-6 py-12 text-center">
              <p className="font-display text-xl">Belum ada catatan</p>
              <p className="mt-2 text-sm text-espresso-500">
                Tambahkan pemasukan atau pengeluaran pertama lewat formulir.
              </p>
            </div>
          ) : null}

          {status === "ready" && entries.length > 0 ? (
            <ul className="mt-4 divide-y divide-line">
              {entries.map((entry) => {
                const income = entry.type === "INCOME";
                return (
                  <li key={entry.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {entry.category}
                        </p>
                        <p className="mt-1 text-sm text-espresso-500">
                          {entry.description}
                        </p>
                        <p className="mt-1 text-xs text-espresso-500">
                          {formatDate(entry.occurredAt)} ·{" "}
                          {income ? "Pemasukan" : "Pengeluaran"}
                          {entry.createdByName
                            ? ` · dicatat oleh ${entry.createdByName}`
                            : ""}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold tabular-nums ${
                          income ? "text-sage-700" : "text-clay-600"
                        }`}
                      >
                        {income ? "+" : "-"}
                        {formatIDR(entry.amount)}
                      </p>
                    </div>

                    {pendingDelete === entry.id ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-ivory-100 p-3">
                        <p className="text-sm">Hapus catatan ini?</p>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => remove(entry.id)}
                          disabled={deletingId === entry.id}
                        >
                          {deletingId === entry.id
                            ? "Menghapus..."
                            : "Ya, hapus"}
                        </Button>
                        <Button
                          type="button"
                          variant="quiet"
                          onClick={() => setPendingDelete(null)}
                          disabled={deletingId === entry.id}
                        >
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="quiet"
                          onClick={() => startEdit(entry)}
                        >
                          Ubah
                        </Button>
                        <Button
                          type="button"
                          variant="quiet"
                          onClick={() => {
                            setPendingDelete(entry.id);
                            setError(null);
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
}
