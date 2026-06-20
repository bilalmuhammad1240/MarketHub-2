import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, MOZAMBIQUE_CITIES } from "@/lib/constants";
import { getCategoryName, sanitizeSearchTerm } from "@/lib/utils";
import SearchFilters from "@/components/SearchFilters";
import ListingCard from "@/components/ListingCard";
import type { ListingWithImages } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

const CATEGORY_SLUGS: readonly string[] = CATEGORIES.map((category) => category.slug);

export default async function AnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    cidade?: string;
    ordenar?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const categoria = CATEGORY_SLUGS.includes(params.categoria ?? "")
    ? (params.categoria as string)
    : "";
  const cidade = (MOZAMBIQUE_CITIES as readonly string[]).includes(params.cidade ?? "")
    ? (params.cidade as string)
    : "";
  const ordenar = params.ordenar === "preco_asc" || params.ordenar === "preco_desc"
    ? params.ordenar
    : "recentes";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      "id, user_id, title, description, price, category, city, whatsapp, status, created_at, listing_images(id, listing_id, image_url, created_at)",
      { count: "exact" }
    )
    .eq("status", "approved");

  const term = sanitizeSearchTerm(q);
  if (term) {
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (categoria) {
    query = query.eq("category", categoria);
  }

  if (cidade) {
    query = query.eq("city", cidade);
  }

  if (ordenar === "preco_asc") {
    query = query.order("price", { ascending: true });
  } else if (ordenar === "preco_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: listings, count } = await query;

  const results = (listings ?? []) as ListingWithImages[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasFilters = Boolean(q || categoria || cidade || ordenar !== "recentes");

  function pageHref(targetPage: number): string {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (categoria) sp.set("categoria", categoria);
    if (cidade) sp.set("cidade", cidade);
    if (ordenar !== "recentes") sp.set("ordenar", ordenar);
    if (targetPage > 1) sp.set("page", String(targetPage));

    const qs = sp.toString();
    return qs ? `/anuncios?${qs}` : "/anuncios";
  }

  let title = "Todos os anúncios";
  if (q && categoria) {
    title = `"${q}" em ${getCategoryName(categoria)}`;
  } else if (q) {
    title = `Resultados para "${q}"`;
  } else if (categoria) {
    title = getCategoryName(categoria);
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold text-primary-dark">{title}</h1>

      <div className="mt-4">
        <SearchFilters q={q} categoria={categoria} cidade={cidade} ordenar={ordenar} />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <p>
          {total === 0
            ? "Nenhum anúncio encontrado"
            : total === 1
              ? "1 anúncio encontrado"
              : `${total} anúncios encontrados`}
        </p>

        {hasFilters && (
          <Link href="/anuncios" className="font-medium text-primary-dark hover:underline">
            Limpar filtros
          </Link>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Não encontrámos anúncios com estes critérios. Tente outras palavras
          ou remova alguns filtros.
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
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
                  href={pageHref(page + 1)}
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
        </>
      )}
    </main>
  );
}
