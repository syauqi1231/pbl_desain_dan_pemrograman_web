import { NextResponse } from "next/server";
import { ApiError, apiError, requireUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { readStored } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const { id } = await params;

    const job = await prisma.tryOnJob.findFirst({
      where: { id, userId: user.id },
      select: { resultPath: true },
    });

    if (!job?.resultPath) {
      throw new ApiError(404, "Hasil try-on belum ada.");
    }

    const buffer = await readStored(job.resultPath);
    const extension = job.resultPath.split(".").pop()?.toLowerCase();
    const type =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, no-store",
        "Content-Disposition":
          new URL(request.url).searchParams.get("download") === "1"
            ? `attachment; filename="fashn-try-on.${extension ?? "jpg"}"`
            : "inline",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
