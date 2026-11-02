import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { ApiError, apiError, requireUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  { params }: Params,
): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where:
        user.role === "ADMIN"
          ? { id }
          : { id, userId: user.id },
      select: {
        paymentMethod: true,
        paymentReference: true,
        status: true,
      },
    });

    if (!order) throw new ApiError(404, "Pesanan tidak ditemukan.");
    if (order.paymentMethod !== "QRIS") {
      throw new ApiError(404, "Pesanan ini memakai transfer bank.");
    }

    const png = await QRCode.toBuffer(order.paymentReference, {
      type: "png",
      width: 512,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#2C2420", light: "#FBF9F6" },
    });

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
