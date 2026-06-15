import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImageCarousel from "@/components/ImageCarousel";
import StatusBadge from "@/components/StatusBadge";
import { formatPrice, getCategoryName, whatsappLink } from "@/lib/utils";
import type { ListingImage, ListingStatus } from "@/lib/types";

export default async function AnuncioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, user_id, title, description, price, category, city, whatsapp, status, created_at, listing_images(id, listing_id, image_url, created_at), profiles(name)"
    )
    .eq("id", id)
    .single();

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
  const sellerName: string = listing.profiles?.name ?? "Vendedor";
  const status = listing.status as ListingStatus;

  const waLink = whatsappLink(
    listing.whatsapp,
    `Olá! Vi o seu anúncio "${listing.title}" no MozMarketHub e gostaria de saber mais.`
  );

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-3xl px-4 py-6">
      {isOwner && status !== "approved" && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            {status === "pending"
              ? "O seu anúncio está em revisão e ainda não é visível ao público."
              : "O seu anúncio foi rejeitado e não é visível ao público."}
          </span>
          <StatusBadge status={status} />
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
