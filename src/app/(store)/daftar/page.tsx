import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirects";

export const metadata = { title: "Buat akun" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    redirect(safeNextPath(params.next));
  }

  return <AuthForm mode="daftar" next={params.next ?? null} />;
}
