export type TryOnJob = {
  id: string;
  provider: "fal" | "stub";
  note: string;
  imageUrl: string | null;
};

export class TryOnError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "TryOnError";
    this.status = status;
  }
}

const MAX_BYTES = 8 * 1024 * 1024;

export async function requestTryOn(input: {
  photo: File;
  productSlug: string;
}): Promise<TryOnJob> {
  if (!input.photo.type.startsWith("image/")) {
    throw new TryOnError("File harus berupa gambar (JPG atau PNG).", 400);
  }

  if (input.photo.size > MAX_BYTES) {
    throw new TryOnError("Ukuran foto melebihi 8 MB. Coba foto lain.", 413);
  }

  const form = new FormData();
  form.set("photo", input.photo);
  form.set("productSlug", input.productSlug);

  const response = await fetch("/api/try-on", {
    method: "POST",
    body: form,
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    job?: TryOnJob;
  };

  if (!response.ok || !data.job) {
    throw new TryOnError(
      data.error ?? "Try-on gagal. Coba lagi sebentar.",
      response.status,
    );
  }

  return data.job;
}
