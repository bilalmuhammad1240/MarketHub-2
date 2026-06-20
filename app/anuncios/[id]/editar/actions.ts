"use server";

import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, MOZAMBIQUE_CITIES } from "@/lib/constants";
import { isValidMozambiquePhone, extractStoragePath } from "@/lib/utils";
import { deleteListingWithImages } from "@/lib/listing-deletion";
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

  console.log("[updateListing/server] payload recebido", {
    listingId,
    userId: user.id,
    novasImageUrls: formData.getAll("imageUrls").length,
    removedImages: formData.getAll("removedImages"),
  });

  if (!title || !description || !priceRaw || !category || !city || !whatsapp) {
    console.warn("[updateListing/server] validação falhou: campos em falta", values);
    return { error: "Preencha todos os campos obrigatórios.", values };
  }

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) {
    console.warn("[updateListing/server] validação falhou: preço inválido", { priceRaw });
    return { error: "Indique um preço válido.", values };
  }

  if (!CATEGORY_SLUGS.includes(category)) {
    console.warn("[updateListing/server] validação falhou: categoria inválida", { category });
    return { error: "Selecione uma categoria válida.", values };
  }

  if (!(MOZAMBIQUE_CITIES as readonly string[]).includes(city)) {
    console.warn("[updateListing/server] validação falhou: cidade inválida", { city });
    return { error: "Selecione uma cidade válida.", values };
  }

  if (!isValidMozambiquePhone(whatsapp)) {
    console.warn("[updateListing/server] validação falhou: whatsapp inválido", { whatsapp });
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
    console.warn("[updateListing/server] validação falhou: excede limite de fotos", {
      currentImageCount,
      removedImageIds,
      newImageUrls,
    });
    return { error: `Pode ter no máximo ${MAX_IMAGES} fotos por anúncio.`, values };
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ title, description, price, category, city, whatsapp })
    .eq("id", listingId);

  if (updateError) {
    console.error("[updateListing/server] erro ao atualizar 'listings'", {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
      listingId,
    });

    return {
      error: `Não foi possível guardar as alterações (${updateError.code ?? "erro"}): ${updateError.message}`,
      values,
    };
  }

  console.log("[updateListing/server] dados do anúncio atualizados com sucesso", { listingId });

  const imageErrors: string[] = [];

  if (removedImageIds.length > 0) {
    const { data: imagesToRemove, error: fetchRemoveError } = await supabase
      .from("listing_images")
      .select("id, image_url")
      .in("id", removedImageIds)
      .eq("listing_id", listingId);

    if (fetchRemoveError) {
      console.error("[updateListing/server] erro ao procurar imagens a remover", {
        code: fetchRemoveError.code,
        message: fetchRemoveError.message,
        removedImageIds,
      });
      imageErrors.push(`Não foi possível remover fotos: ${fetchRemoveError.message}`);
    }

    for (const image of imagesToRemove ?? []) {
      const path = extractStoragePath(image.image_url, BUCKET);

      if (path) {
        const { error: storageRemoveError } = await supabase.storage.from(BUCKET).remove([path]);
        if (storageRemoveError) {
          console.error("[updateListing/server] erro ao remover ficheiro do storage", {
            path,
            message: storageRemoveError.message,
          });
        }
      } else {
        console.warn("[updateListing/server] não foi possível extrair o caminho do storage", {
          imageUrl: image.image_url,
        });
      }

      const { error: deleteRowError } = await supabase
        .from("listing_images")
        .delete()
        .eq("id", image.id);

      if (deleteRowError) {
        console.error("[updateListing/server] erro ao apagar linha de listing_images", {
          imageId: image.id,
          code: deleteRowError.code,
          message: deleteRowError.message,
        });
        imageErrors.push(`Não foi possível remover uma foto: ${deleteRowError.message}`);
      }
    }
  }

  if (newImageUrls.length > 0) {
    const { error: insertImagesError } = await supabase.from("listing_images").insert(
      newImageUrls.map((image_url) => ({
        listing_id: listingId,
        image_url,
      }))
    );

    if (insertImagesError) {
      // Mesma falha silenciosa identificada em createListing: o upload
      // para o Storage tem sucesso, mas a ligação em "listing_images"
      // falha (RLS, FK, etc.). Agora é registada e propagada.
      console.error("[updateListing/server] erro ao inserir novas linhas em 'listing_images'", {
        code: insertImagesError.code,
        message: insertImagesError.message,
        details: insertImagesError.details,
        hint: insertImagesError.hint,
        listingId,
        newImageUrls,
      });
      imageErrors.push(
        `As novas fotos não foram guardadas (${insertImagesError.code ?? "erro"}): ${insertImagesError.message}`
      );
    } else {
      console.log("[updateListing/server] novas imagens associadas com sucesso", {
        listingId,
        total: newImageUrls.length,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  revalidatePath(`/anuncios/${listingId}`);

  if (imageErrors.length > 0) {
    redirect(
      `/anuncios/${listingId}?updated=1&imageError=${encodeURIComponent(imageErrors.join(" | "))}`
    );
  }

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

  console.log("[deleteListing/server] pedido recebido", { listingId, userId: user.id });

  const { data: existing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", listingId)
    .single();

  if (!existing || existing.user_id !== user.id) {
    console.warn("[deleteListing/server] não autorizado ou inexistente", {
      listingId,
      userId: user.id,
      existing,
    });
    notFound();
  }

  await deleteListingWithImages(supabase, listingId);

  console.log("[deleteListing/server] anúncio eliminado com sucesso", { listingId });

  revalidatePath("/");
  revalidatePath("/meus-anuncios");
  redirect("/meus-anuncios");
}
