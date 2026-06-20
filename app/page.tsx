import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import ListingCard from "@/components/ListingCard";
import QueryErrorToast from "@/components/QueryErrorToast";
import type { ListingWithImages } from "@/lib/types";

// Evita que esta página fique presa em cache estático entre deploys —
// "Últimos anúncios" precisa de refletir sempre o estado atual da BD.
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select(
      "id, user_id, title, description, price, category, city, whatsapp, status, created_at, listing_images(id, listing_id, image_url, created_at)"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(8);

  if (listingsError) {
    console.error("[Home/server] erro ao procurar 'listings'", {
      code: listingsError.code,
      message: listingsError.message,
      details: listingsError.details,
      hint: listingsError.hint,
    });
  }

  const recentListings = (listings ?? []) as ListingWithImages[];

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-5xl px-4 py-8">
      <QueryErrorToast
        title="Erro ao carregar anúncios"
        message={listingsError ? `${listingsError.code ?? "erro"}: ${listingsError.message}` : null}
      />

      <section className="rounded-lg bg-primary-dark px-6 py-10 text-center text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Compre, venda e anuncie em Moçambique
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/80 sm:text-base">
          Produtos, serviços, veículos, casas e empregos — tudo num só lugar.
        </p>

        <form action="/anuncios" method="get" className="mx-auto mt-6 flex max-w-md gap-2">
          <label htmlFor="q" className="sr-only">
            Pesquisar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="O que está a procurar?"
            className="w-full rounded-md border-0 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Pesquisar
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {user ? (
            <Link
              href="/anuncios/novo"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Publicar anúncio
            </Link>
          ) : (
            <>
              <Link
                href="/registo"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Criar conta gratuita
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800">Categorias</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/anuncios?categoria=${category.slug}`}
              className="rounded-lg border border-gray-200 bg-white px-4 py-4 text-center text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary-dark"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Últimos anúncios</h2>
          <Link href="/anuncios" className="text-sm font-medium text-primary-dark hover:underline">
            Ver todos
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            Ainda não há anúncios publicados. Seja o primeiro!
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
