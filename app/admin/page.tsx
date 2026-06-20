import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalListings },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "rejected"),
  ]);

  const stats = [
    { label: "Utilizadores", value: totalUsers ?? 0, href: "/admin/utilizadores" },
    { label: "Anúncios (total)", value: totalListings ?? 0, href: "/admin/anuncios?status=all" },
    { label: "Pendentes", value: pendingCount ?? 0, href: "/admin/anuncios?status=pending" },
    { label: "Aprovados", value: approvedCount ?? 0, href: "/admin/anuncios?status=approved" },
    { label: "Rejeitados", value: rejectedCount ?? 0, href: "/admin/anuncios?status=rejected" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark">Painel de administração</h1>
      <p className="mt-1 text-sm text-gray-500">Visão geral do MozMarketHub.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-primary hover:shadow-sm"
          >
            <p className="text-2xl font-bold text-primary-dark">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {(pendingCount ?? 0) > 0 && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {pendingCount === 1
            ? "Há 1 anúncio à espera de revisão."
            : `Há ${pendingCount} anúncios à espera de revisão.`}{" "}
          <Link href="/admin/anuncios?status=pending" className="font-semibold underline">
            Rever agora
          </Link>
        </div>
      )}
    </div>
  );
}
