"use server";

import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, MOZAMBIQUE_CITIES } from "@/lib/constants";
import { isValidMozambiquePhone, extractStoragePath } from "@/lib/utils";
import type { ListingFieldValues } from "@/components/ListingFields";
import type { ListingActionState } from "@/app/anuncios/novo/actions";

const CATEGORY_SLUGS: readonly string[] = CATEGORIES.map((category) => category.slug);
const MAX_IMAGES = 5;
const BUCKET = "listings";

export async function updateListing(formData: FormData): Promise<ListingActionState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const listingId = String(formData.get("listingId") ?? "").trim();

  const { data: existing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", listingId)
    .single();

  if (!existing || existing.user_id !== user.id) {
    notFound();
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

  const removedImageIds = formData.getAll("removedImages").map(String).filter(Boolean);

  // Imagens novas já foram enviadas para o Storage no browser; aqui
  // recebemos apenas os URLs públicos resultantes.
  const newImageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);

  const { count: currentImageCount } = await supabase
    .from("listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  const remainingAfterRemoval = (currentImageCount ?? 0) - removedImageIds.length;

  if (remainingAfterRemoval + newImageUrls.length > MAX_IMAGES) {
    return { error: `Pode ter no máximo ${MAX_IMAGES} fotos por anúncio.`, values };
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ title, description, price, category, city, whatsapp })
    .eq("id", listingId);

  if (updateError) {
    return {
      error: "Não foi possível guardar as alterações. Tente novamente.",
      values,
    };
  }

  if (removedImageIds.length > 0) {
    const { data: imagesToRemove } = await supabase
      .from("listing_images")
      .select("id, image_url")
      .in("id", removedImageIds)
      .eq("listing_id", listingId);

    for (const image of imagesToRemove ?? []) {
      const path = extractStoragePath(image.image_url, BUCKET);
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
      await supabase.from("listing_images").delete().eq("id", image.id);
    }
  }

  if (newImageUrls.length > 0) {
    const rows = newImageUrls.map((image_url) => ({
      listing_id: listingId,
      image_url,
    }));

    await supabase.from("listing_images").insert(rows);
  }

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  revalidatePath(`/anuncios/${listingId}`);
  redirect(`/anuncios/${listingId}?updated=1`);
}

export async function deleteListing(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const listingId = String(formData.get("listingId") ?? "").trim();

  const { data: existing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", listingId)
    .single();

  if (!existing || existing.user_id !== user.id) {
    notFound();
  }

  const { data: images } = await supabase
    .from("listing_images")
    .select("image_url")
    .eq("listing_id", listingId);

  const paths = (images ?? [])
    .map((image) => extractStoragePath(image.image_url, BUCKET))
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  // As linhas em "listing_images" são removidas automaticamente
  // (ON DELETE CASCADE).
  await supabase.from("listings").delete().eq("id", listingId);

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  redirect("/meus-anuncios");
}
