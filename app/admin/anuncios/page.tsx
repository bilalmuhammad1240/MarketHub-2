import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import { formatPrice, getCategoryName } from "@/lib/utils";
import { approveListing, rejectListing, adminDeleteListing } from "@/app/admin/actions";
import type { ListingStatus, SellerProfile } from "@/lib/types";

const PAGE_SIZE = 20;
const TABS = [
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
  { value: "all", label: "Todos" },
] as const;

type AdminListingRow = {
  id: string;
  title: string;
  price: number;
  city: string;
  category: string;
  status: ListingStatus;
  rejection_reason: string | null;
  created_at: string;
  listing_images: { image_url: string }[];
  profiles: SellerProfile;
};

export default async function AdminAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = TABS.map((tab) => tab.value).includes(
    (params.status ?? "pending") as (typeof TABS)[number]["value"]
  )
    ? ((params.status ?? "pending") as (typeof TABS)[number]["value"])
    : "pending";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      "id, title, price, city, category, status, rejection_reason, created_at, listing_images(image_url), profiles(name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  const listings = (data ?? []) as unknown as AdminListingRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetStatus: string, targetPage = 1): string {
    const sp = new URLSearchParams();
    if (targetStatus !== "pending") sp.set("status", targetStatus);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `/admin/anuncios?${qs}` : "/admin/anuncios";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark">Anúncios</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto text-sm">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={pageHref(tab.value)}
            className={`shrink-0 rounded-full px-4 py-2 font-medium ${
              status === tab.value
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {total === 0 ? "Nenhum anúncio" : total === 1 ? "1 anúncio" : `${total} anúncios`}
      </p>

      {listings.length === 0 ? (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Nada para mostrar aqui.
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {listings.map((listing) => {
            const cover = listing.listing_images?.[0]?.image_url;
            const profilesRaw = listing.profiles as SellerProfile;
            const profileObj = Array.isArray(profilesRaw) ? profilesRaw[0] : profilesRaw;
            const sellerName: string | null = profileObj?.name ?? null;

            return (
              <div key={listing.id} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {cover && (
                      <Image
                        src={cover}
                        alt={listing.title}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
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
                    <p className="text-xs text-gray-500">
                      {listing.city} · {getCategoryName(listing.category)}
                    </p>
                    {sellerName && (
                      <p className="mt-1 truncate text-xs text-gray-400">{sellerName}</p>
                    )}
                    {listing.status === "rejected" && listing.rejection_reason && (
                      <p className="mt-1 text-xs text-red-600">
                        Motivo: {listing.rejection_reason}
                      </p>
                    )}
                  </div>

                  <StatusBadge status={listing.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-start gap-2 text-xs">
                  {listing.status !== "approved" && (
                    <form action={approveListing}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <input type="hidden" name="status" value={status} />
                      <input type="hidden" name="page" value={page} />
                      <button
                        type="submit"
                        className="rounded-md bg-primary px-3 py-1.5 font-semibold text-white hover:bg-primary-dark"
                      >
                        Aprovar
                      </button>
                    </form>
                  )}

                  {listing.status !== "rejected" && (
                    <details className="inline-block">
                      <summary className="cursor-pointer rounded-md border border-amber-300 px-3 py-1.5 font-semibold text-amber-700 hover:bg-amber-50">
                        Rejeitar
                      </summary>
                      <form
                        action={rejectListing}
                        className="mt-2 flex flex-col gap-2 sm:flex-row"
                      >
                        <input type="hidden" name="listingId" value={listing.id} />
                        <input type="hidden" name="status" value={status} />
                        <input type="hidden" name="page" value={page} />
                        <input
                          type="text"
                          name="reason"
                          placeholder="Motivo (opcional)"
                          maxLength={200}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700"
                        >
                          Confirmar rejeição
                        </button>
                      </form>
                    </details>
                  )}

                  <details className="inline-block">
                    <summary className="cursor-pointer rounded-md border border-red-200 px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50">
                      Eliminar
                    </summary>
                    <form action={adminDeleteListing} className="mt-2">
                      <input type="hidden" name="listingId" value={listing.id} />
                      <input type="hidden" name="status" value={status} />
                      <input type="hidden" name="page" value={page} />
                      <button
                        type="submit"
                        className="rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700"
                      >
                        Confirmar eliminação
                      </button>
                    </form>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={pageHref(status, page - 1)}
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
              href={pageHref(status, page + 1)}
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
