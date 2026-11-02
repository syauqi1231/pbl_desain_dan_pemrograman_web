import type { OrderStatus, PaymentStatus } from "@/lib/types";
import {
  orderStatusLabels,
  orderStatusStyles,
  paymentStatusLabels,
} from "@/lib/format";

export function StatusText({ status }: { status: OrderStatus }) {
  return (
    <span className={`text-sm font-medium ${orderStatusStyles[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}

export function PaymentStatusText({ status }: { status: PaymentStatus }) {
  const style =
    status === "VERIFIED"
      ? "text-sage-700"
      : status === "REJECTED"
        ? "text-clay-600"
        : "text-amber-700";

  return (
    <span className={`text-sm font-medium ${style}`}>
      {paymentStatusLabels[status]}
    </span>
  );
}

export function SampleTag() {
  return (
    <span className="rounded-full border border-line px-3 py-1 text-xs text-espresso-500">
      Contoh data
    </span>
  );
}
