import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(80, "Nama maksimal 80 karakter."),
  email: z.email("Masukkan alamat email yang valid."),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter.")
    .max(200, "Kata sandi terlalu panjang."),
});

export const loginSchema = z.object({
  email: z.email("Masukkan alamat email yang valid."),
  password: z.string().min(1, "Masukkan kata sandi."),
});

const variantSchema = z.object({
  size: z
    .string()
    .trim()
    .min(1, "Ukuran wajib diisi.")
    .max(30, "Ukuran maksimal 30 karakter."),
  stock: z.coerce
    .number()
    .int("Stok harus bilangan bulat.")
    .min(0, "Stok tidak boleh negatif.")
    .max(10000, "Stok maksimal 10.000."),
});

export const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Slug minimal 3 karakter.")
    .max(80, "Slug maksimal 80 karakter.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
    ),
  name: z
    .string()
    .trim()
    .min(2, "Nama produk minimal 2 karakter.")
    .max(120, "Nama produk maksimal 120 karakter."),
  description: z
    .string()
    .trim()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(2000, "Deskripsi maksimal 2.000 karakter."),
  material: z
    .string()
    .trim()
    .min(2, "Bahan minimal 2 karakter.")
    .max(120, "Bahan maksimal 120 karakter."),
  price: z.coerce
    .number()
    .int("Harga harus bilangan bulat.")
    .min(1000, "Harga minimal Rp 1.000.")
    .max(100000000, "Harga maksimal Rp 100.000.000."),
  collections: z
    .array(z.enum(["baru", "batik", "kebaya"]))
    .min(1, "Pilih minimal satu koleksi."),
  tone: z.coerce.number().int().min(200).max(500).default(300),
  image: z
    .string()
    .trim()
    .max(300, "Path gambar terlalu panjang.")
    .regex(
      /^\/[A-Za-z0-9/_.-]+$/,
      "Path gambar harus diawali / dan hanya berisi huruf, angka, garis miring, atau tanda hubung.",
    )
    .optional()
    .or(z.literal("")),
  imageAlt: z
    .string()
    .trim()
    .max(200, "Alt gambar maksimal 200 karakter.")
    .optional()
    .or(z.literal("")),
  tryOnCategory: z
    .enum(["upper_body", "lower_body", "dresses"])
    .default("upper_body"),
  variants: z
    .array(variantSchema)
    .min(1, "Tambahkan minimal satu ukuran.")
    .max(20, "Maksimal 20 ukuran."),
  active: z.boolean().default(true),
});

export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        size: z.string().trim().min(1),
        qty: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1, "Keranjang masih kosong.")
    .max(50, "Terlalu banyak baris pesanan."),
  recipientName: z
    .string()
    .trim()
    .min(2, "Nama penerima minimal 2 karakter.")
    .max(100, "Nama penerima maksimal 100 karakter."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, "Masukkan nomor telepon yang valid."),
  addressLine: z
    .string()
    .trim()
    .min(8, "Alamat minimal 8 karakter.")
    .max(300, "Alamat maksimal 300 karakter."),
  city: z
    .string()
    .trim()
    .min(2, "Kota minimal 2 karakter.")
    .max(100, "Kota maksimal 100 karakter."),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{5}$/, "Kode pos terdiri dari 5 angka."),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter.").optional(),
  paymentMethod: z.enum(["QRIS", "BANK_TRANSFER"]),
});

export const orderActionSchema = z.object({
  action: z.enum([
    "verify",
    "reject",
    "process",
    "ship",
    "complete",
    "cancel",
  ]),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter.").optional(),
});
