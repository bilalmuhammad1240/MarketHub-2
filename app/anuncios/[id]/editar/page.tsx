import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingEditForm from "./listing-edit-form";
import type { Listing, ListingImage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditarAnuncioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect(`/login?next=/anuncios/${id}/editar`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, user_id, title, description, price, category, city, whatsapp, status, created_at, listing_images(id, listing_id, image_url, created_at)"
    )
    .eq("id", id)
    .single();

  if (!listing || listing.user_id !== user.id) {
    notFound();
  }

  const { listing_images, ...listingFields } = listing;

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-lg px-6 py-8">
      <h1 className="text-2xl font-bold text-primary-dark">Editar anúncio</h1>
      <p className="mt-1 text-sm text-gray-500">
        Alterações ficam novamente em revisão antes de aparecer ao público.
      </p>

      <div className="mt-6">
        <ListingEditForm
          userId={user.id}
          listing={listingFields as Listing}
          images={(listing_images ?? []) as ListingImage[]}
        />
      </div>
    </main>
  );
}
