"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, MOZAMBIQUE_CITIES } from "@/lib/constants";
import { isValidMozambiquePhone } from "@/lib/utils";
import type { ListingFieldValues } from "@/components/ListingFields";

export type ListingActionState = {
  error?: string;
  values?: ListingFieldValues;
} | null;

const CATEGORY_SLUGS: readonly string[] = CATEGORIES.map((category) => category.slug);
const MAX_IMAGES = 5;

export async function createListing(formData: FormData): Promise<ListingActionState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/anuncios/novo");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  const values: ListingFieldValues = {
    title,
    description,
    price: priceRaw,
    category,
    city,
    whatsapp,
  };

  if (!title || !description || !priceRaw || !category || !city || !whatsapp) {
    return { error: "Preencha todos os campos obrigatórios.", values };
  }

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Indique um preço válido.", values };
  }

  if (!CATEGORY_SLUGS.includes(category)) {
    return { error: "Selecione uma categoria válida.", values };
  }

  if (!(MOZAMBIQUE_CITIES as readonly string[]).includes(city)) {
    return { error: "Selecione uma cidade válida.", values };
  }

  if (!isValidMozambiquePhone(whatsapp)) {
    return {
      error: "Indique um número de WhatsApp válido (ex: 84xxxxxxx).",
      values,
    };
  }

  // As imagens já foram enviadas para o Supabase Storage no browser
  // (ver listing-form.tsx); aqui apenas guardamos os URLs públicos.
  const imageUrls = formData
    .getAll("imageUrls")
    .map(String)
    .filter(Boolean)
    .slice(0, MAX_IMAGES);

  // ID pré-gerado no cliente, usado para organizar as imagens no Storage
  // antes do registo do anúncio existir.
  const clientId = String(formData.get("id") ?? "").trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    clientId
  );

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    title,
    description,
    price,
    category,
    city,
    whatsapp,
  };

  if (isUuid) {
    insertPayload.id = clientId;
  }

  const { data: listing, error: insertError } = await supabase
    .from("listings")
    .insert(insertPayload)
    .select("id")
    .single();

if (insertError || !listing) {
  console.error("createListing insert error:", insertError);
    return {
    error: insertError
     ? `Não foi possível publicar o anúncio: ${insertError.message}`
      : "Não foi possível publicar o anúncio. Tente novamente.",
      values,
    };
  }  

  if (imageUrls.length > 0) {
    const { error: imagesError } = await supabase.from("listing_images").insert(
      imageUrls.map((image_url) => ({
        listing_id: listing.id,
        image_url,
      }))
    );

    if (imagesError) {
      console.error("createListing: erro ao inserir em 'listing_images'", imagesError);
    }
  }

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  redirect(`/anuncios/${listing.id}?created=1`);
}
