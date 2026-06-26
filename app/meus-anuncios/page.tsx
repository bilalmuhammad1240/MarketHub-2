import Link from "next/link";
import TrackedImage from "@/components/TrackedImage";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import QueryErrorToast from "@/components/QueryErrorToast";
import DeleteListingButton from "./delete-listing-button";
import { formatPrice } from "@/lib/utils";
import type { ListingStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type ListingRow = {
  id: string;
  title: string;
  price: number;
  city: string;
  status: ListingStatus;
  created_at: string;
  listing_images: { image_url: string }[];
};

export default async function MeusAnunciosPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/meus-anuncios");
  }

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id, title, price, city, status, created_at, listing_images(image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (listingsError) {
    console.error("[MeusAnuncios/server] erro ao procurar 'listings'", {
      userId: user.id,
      code: listingsError.code,
      message: listingsError.message,
      details: listingsError.details,
      hint: listingsError.hint,
    });
  }

  const rows = (listings ?? []) as ListingRow[];

  return (
    <main className="mx-auto min-h-[calc(100vh-56px)] max-w-3xl px-4 py-6">
      <QueryErrorToast
        title="Erro ao carregar os seus anúncios"
        message={listingsError ? `${listingsError.code ?? "erro"}: ${listingsError.message}` : null}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-dark">Os meus anúncios</h1>
        <Link
          href="/anuncios/novo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          + Novo
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Ainda não tem anúncios publicados.
          <div className="mt-3">
            <Link
              href="/anuncios/novo"
              className="font-semibold text-primary-dark hover:underline"
            >
              Publicar o primeiro anúncio
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((listing) => {
            const cover = listing.listing_images?.[0]?.image_url;

            return (
              <div
                key={listing.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {cover && (
                    <TrackedImage src={cover} alt={listing.title} fill unoptimized sizes="64px" className="object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/anuncios/${listing.id}`}
                    className="block truncate text-sm font-medium text-gray-800 hover:text-primary-dark"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-sm font-bold text-primary-dark">
                    {formatPrice(listing.price)}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={listing.status} />
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <Link
                    href={`/anuncios/${listing.id}/editar`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Editar
                  </Link>
                  <DeleteListingButton listingId={listing.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
