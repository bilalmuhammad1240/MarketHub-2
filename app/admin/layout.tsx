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
      <nav className="mb-6 flex gap-4 overflow-x-auto border-b border-gray-200 text-sm font-medium text-gray-600 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/admin"
          className="shrink-0 border-b-2 border-transparent pb-3 hover:border-primary hover:text-primary-dark"
        >
          Painel
        </Link>
        <Link
          href="/admin/anuncios"
          className="shrink-0 border-b-2 border-transparent pb-3 hover:border-primary hover:text-primary-dark"
        >
          Anúncios
        </Link>
        <Link
          href="/admin/utilizadores"
          className="shrink-0 border-b-2 border-transparent pb-3 hover:border-primary hover:text-primary-dark"
        >
          Utilizadores
        </Link>
        <Link
          href="/admin/configuracoes"
          className="shrink-0 border-b-2 border-transparent pb-3 hover:border-primary hover:text-primary-dark"
        >
          Configurações
        </Link>
      </nav>

      {children}
    </main>
  );
}
