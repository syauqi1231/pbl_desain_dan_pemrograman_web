import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve(
  process.env.DATA_DIR?.trim() || path.join(process.cwd(), ".data"),
);

const PUBLIC_DIR = path.join(process.cwd(), "public");

const kinds = new Set(["proofs", "tryon", "results"]);

const mimeExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export type UploadKind = "proofs" | "tryon" | "results";

export async function saveUpload(
  file: File,
  kind: UploadKind,
  maxBytes: number,
): Promise<{ path: string; mime: string; name: string }> {
  if (!kinds.has(kind)) throw new Error("Jenis unggahan tidak dikenal.");

  const extension = mimeExtensions[file.type];
  if (!extension) {
    throw new Error("Format file harus JPG, PNG, atau WEBP.");
  }

  if (file.size > maxBytes) {
    throw new Error(
      `Ukuran file melebihi ${Math.round(maxBytes / 1024 / 1024)} MB.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new Error("File kosong.");
  }

  const directory = path.join(DATA_DIR, kind);
  await mkdir(directory, { recursive: true });

  const filename = `${randomUUID()}${extension}`;
  await writeFile(path.join(directory, filename), buffer);

  return {
    path: `${kind}/${filename}`,
    mime: file.type,
    name: file.name.slice(0, 200) || filename,
  };
}

export async function saveBuffer(
  buffer: Buffer,
  kind: UploadKind,
  extension: string,
): Promise<string> {
  if (!kinds.has(kind)) throw new Error("Jenis unggahan tidak dikenal.");
  const safeExtension = extension.startsWith(".") ? extension : `.${extension}`;
  if (!allowedExtensions.has(safeExtension.toLowerCase())) {
    throw new Error("Ekstensi file tidak dikenal.");
  }

  const directory = path.join(DATA_DIR, kind);
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}${safeExtension.toLowerCase()}`;
  await writeFile(path.join(directory, filename), buffer);
  return `${kind}/${filename}`;
}

export async function readStored(relativePath: string): Promise<Buffer> {
  const [kind, filename, extra] = relativePath.split("/");
  if (
    extra !== undefined ||
    !kinds.has(kind) ||
    !filename ||
    !allowedExtensions.has(path.extname(filename).toLowerCase())
  ) {
    throw new Error("Path file tidak valid.");
  }

  const full = path.resolve(DATA_DIR, kind, filename);
  const root = path.resolve(DATA_DIR, kind);
  if (!full.startsWith(`${root}${path.sep}`)) {
    throw new Error("Path file tidak valid.");
  }

  return readFile(full);
}

export async function readPublicImage(publicPath: string): Promise<Buffer> {
  const clean = publicPath.replace(/^\/+/, "");
  const full = path.resolve(PUBLIC_DIR, clean);
  if (!full.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    throw new Error("Path gambar tidak valid.");
  }
  return readFile(full);
}
