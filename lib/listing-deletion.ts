import type { SupabaseClient } from "@supabase/supabase-js";
import { extractStoragePath } from "./utils";

const BUCKET = "listings";

// Apaga um anúncio e as suas imagens associadas (Storage + tabela
// listing_images, esta última automaticamente via ON DELETE CASCADE).
// Usado pela eliminação feita pelo dono (app/anuncios/[id]/editar/actions.ts)
// e pela eliminação feita por administradores (app/admin/actions.ts).
// A autorização (dono ou admin) deve ser verificada pelo chamador antes
// de invocar esta função.
export async function deleteListingWithImages(
  supabase: SupabaseClient,
  listingId: string
): Promise<void> {
  const { data: images, error: fetchError } = await supabase
    .from("listing_images")
    .select("image_url")
    .eq("listing_id", listingId);

  if (fetchError) {
    console.error("[deleteListingWithImages] erro ao procurar imagens", {
      listingId,
      message: fetchError.message,
    });
  }

  const paths = (images ?? [])
    .map((image: { image_url: string }) => extractStoragePath(image.image_url, BUCKET))
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths);

    if (removeError) {
      console.error("[deleteListingWithImages] erro ao remover ficheiros do storage", {
        listingId,
        paths,
        message: removeError.message,
      });
    } else {
      console.log("[deleteListingWithImages] ficheiros removidos do storage", {
        listingId,
        total: paths.length,
      });
    }
  }

  // As linhas em "listing_images" são removidas automaticamente
  // (ON DELETE CASCADE).
  const { error: deleteError } = await supabase.from("listings").delete().eq("id", listingId);

  if (deleteError) {
    console.error("[deleteListingWithImages] erro ao apagar o anúncio", {
      listingId,
      code: deleteError.code,
      message: deleteError.message,
    });
  }
}
