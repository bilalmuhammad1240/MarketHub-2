import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

type UserRow = {
  id: string;
  name: string;
  email: string;
  city: string | null;
  role: string;
  created_at: string;
};

export default async function AdminUtilizadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const supabase = await createClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("profiles")
    .select("id, name, email, city, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const users = (data ?? []) as UserRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  let listingCounts: Record<string, number> = {};
  if (users.length > 0) {
    const { data: listingRows } = await supabase
      .from("listings")
      .select("user_id")
      .in(
        "user_id",
        users.map((u) => u.id)
      );

    listingCounts = (listingRows ?? []).reduce<Record<string, number>>((acc, row) => {
      const userId = String(row.user_id);
      acc[userId] = (acc[userId] ?? 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark">Utilizadores</h1>
      <p className="mt-1 text-sm text-gray-500">
        {total === 1 ? "1 utilizador registado" : `${total} utilizadores registados`}
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Anúncios</th>
              <th className="px-4 py-3">Registado em</th>
              <th className="px-4 py-3">Função</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.city ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{listingCounts[u.id] ?? 0}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(u.created_at).toLocaleDateString("pt-PT")}
                </td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
                      Admin
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Utilizador</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`/admin/utilizadores?page=${page - 1}`}
              className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Anterior
            </Link>
          ) : (
            <span className="rounded-md border border-gray-200 px-4 py-2 font-medium text-gray-300">
              Anterior
            </span>
          )}

          <span className="text-gray-500">
            Página {page} de {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/admin/utilizadores?page=${page + 1}`}
              className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Seguinte
            </Link>
          ) : (
            <span className="rounded-md border border-gray-200 px-4 py-2 font-medium text-gray-300">
              Seguinte
            </span>
          )}
        </div>
      )}
    </div>
  );
}
