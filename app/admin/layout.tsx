import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-5xl px-4 py-6">
      <nav className="mb-6 flex gap-4 border-b border-gray-200 text-sm font-medium text-gray-600">
        <Link
          href="/admin"
          className="border-b-2 border-transparent pb-3 hover:border-primary hover:text-primary-dark"
        >
          Painel
        </Link>
        <Link
          href="/admin/anuncios"
          className="border-b-2 border-transparent pb-3 hover:border-primary hover:text-primary-dark"
        >
          Anúncios
        </Link>
        <Link
          href="/admin/utilizadores"
          className="border-b-2 border-transparent pb-3 hover:border-primary hover:text-primary-dark"
        >
          Utilizadores
        </Link>
      </nav>

      {children}
    </main>
  );
}
