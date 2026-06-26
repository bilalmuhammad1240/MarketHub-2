import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";
import ListingCard from "@/components/ListingCard";
import QueryErrorToast from "@/components/QueryErrorToast";
import type { ListingWithImages } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const [settings, listingsResult] = await Promise.all([
    getSiteSettings(),
    supabase
      .from("listings")
      .select(
        "id, user_id, title, description, price, category, city, whatsapp, status, created_at, listing_images(id, listing_id, image_url, created_at)"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const { data: listings, error: listingsError } = listingsResult;

  if (listingsError) {
    console.error("[Home/server] erro ao procurar 'listings'", {
      code: listingsError.code,
      message: listingsError.message,
    });
  }

  const recentListings = (listings ?? []) as ListingWithImages[];

  return (
    <main className="min-h-[calc(100vh-57px)]">
      <QueryErrorToast
        title="Erro ao carregar anúncios"
        message={listingsError ? `${listingsError.code ?? "erro"}: ${listingsError.message}` : null}
      />

      {/* ── HERO / BANNER ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary-dark">
        {settings.banner_url && (
          <Image
            src={settings.banner_url}
            alt=""
            fill
            unoptimized
            className="object-cover opacity-20"
            priority
          />
        )}
        <div className="relative mx-auto max-w-5xl px-4 py-10 text-center text-white sm:py-14">
          {settings.logo_url && (
            <div className="mb-4 flex justify-center">
              <Image
                src={settings.logo_url}
                alt={settings.site_name}
                width={120}
                height={48}
                unoptimized
                className="h-12 w-auto object-contain"
              />
            </div>
          )}

          <h1 className="text-2xl font-bold sm:text-3xl">{settings.banner_heading}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/80 sm:text-base">
            {settings.banner_subtext}
          </p>

          <form action="/anuncios" method="get" className="mx-auto mt-6 flex max-w-md gap-2">
            <label htmlFor="q" className="sr-only">Pesquisar</label>
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

          {!user && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* ── CATEGORIAS (scroll horizontal compacto) ───────── */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Categorias</h2>
            <Link href="/anuncios" className="text-xs font-medium text-primary-dark hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/anuncios?categoria=${category.slug}`}
                className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-primary hover:shadow-sm"
              >
                <span className="text-2xl leading-none">{category.icon}</span>
                <span className="text-xs font-medium text-gray-700">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── ÚLTIMOS ANÚNCIOS ──────────────────────────────── */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Últimos anúncios</h2>
            <Link href="/anuncios" className="text-xs font-medium text-primary-dark hover:underline">
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
      </div>
    </main>
  );
}
