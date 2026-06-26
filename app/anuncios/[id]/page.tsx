import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImageCarousel from "@/components/ImageCarousel";
import StatusBadge from "@/components/StatusBadge";
import QueryErrorToast from "@/components/QueryErrorToast";
import { formatPrice, getCategoryName, whatsappLink } from "@/lib/utils";
import type { ListingImage, ListingStatus, SellerProfile } from "@/lib/types";

// Força esta página a ser sempre renderizada no servidor a cada pedido.
// Sem isto, o Next.js pode tratar esta rota como estática/em cache, e o
// conteúdo (incluindo fotos e estado do anúncio) não atualiza entre
// deploys nem quando o anúncio muda.
export const dynamic = "force-dynamic";

export default async function AnuncioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imageError?: string }>;
}) {
  const { id } = await params;
  const { imageError } = await searchParams;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(
      "id, user_id, title, description, price, category, city, whatsapp, status, rejection_reason, created_at, listing_images(id, listing_id, image_url, created_at), profiles(name)"
    )
    .eq("id", id)
    .single();

  if (listingError) {
    console.error("[AnuncioPage/server] erro ao procurar 'listings'", {
      id,
      code: listingError.code,
      message: listingError.message,
      details: listingError.details,
      hint: listingError.hint,
    });
  }

  if (!listing) {
    notFound();
  }

  const isOwner = user?.id === listing.user_id;

  // A política RLS já impede o acesso a anúncios pendentes/rejeitados de
  // outros utilizadores; mantemos esta verificação por clareza.
  if (listing.status !== "approved" && !isOwner) {
    notFound();
  }

  const images = (listing.listing_images ?? []) as ListingImage[];
  const status = listing.status as ListingStatus;

  // O supabase-js infere "profiles" como array (sem tipos gerados do
  // schema), mas o PostgREST devolve um objeto único nesta relação
  // (listings.user_id -> profiles.id). Tratamos os dois casos.
  const sellerProfile = listing.profiles as SellerProfile;
  const seller = Array.isArray(sellerProfile) ? sellerProfile[0] : sellerProfile;
  const sellerName: string = seller?.name ?? "Vendedor";

  const waLink = whatsappLink(
    listing.whatsapp,
    `Olá! Vi o seu anúncio "${listing.title}" no MozMarketHub e gostaria de saber mais.`
  );

  return (
    <main className="mx-auto min-h-[calc(100vh-56px)] max-w-3xl px-4 py-6">
      <QueryErrorToast title="As fotos do anúncio não foram guardadas" message={imageError} />

      {isOwner && status !== "approved" && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-center justify-between gap-3">
            <span>
              {status === "pending"
                ? "O seu anúncio está em revisão e ainda não é visível ao público."
                : "O seu anúncio foi rejeitado e não é visível ao público."}
            </span>
            <StatusBadge status={status} />
          </div>
          {status === "rejected" && listing.rejection_reason && (
            <p className="mt-2">
              <span className="font-semibold">Motivo:</span> {listing.rejection_reason}
            </p>
          )}
        </div>
      )}

      <ImageCarousel images={images} />

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{listing.title}</h1>
          {isOwner && (
            <Link
              href={`/anuncios/${listing.id}/editar`}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Editar
            </Link>
          )}
        </div>

        <p className="mt-1 text-2xl font-bold text-primary-dark">
          {formatPrice(listing.price)}
        </p>

        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
          <span className="rounded-full bg-gray-100 px-3 py-1">{listing.city}</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">
            {getCategoryName(listing.category)}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-line text-sm text-gray-700">
          {listing.description}
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Anunciado por <span className="font-medium text-gray-800">{sellerName}</span>
        </p>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark"
        >
          Conversar no WhatsApp
        </a>
      </div>
    </main>
  );
}
