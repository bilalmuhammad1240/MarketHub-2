"use client";

import { useRef, useState } from "react";
import TrackedImage from "@/components/TrackedImage";
import { createClient } from "@/lib/supabase/client";
import { updateListing } from "./actions";
import ListingFields, { type ListingFieldValues } from "@/components/ListingFields";
import ImageUploadField, { type ImageUploadFieldRef } from "@/components/ImageUploadField";
import { useToast } from "@/components/Toast";
import type { Listing, ListingImage } from "@/lib/types";

// O Next.js sinaliza um redirect() chamado numa Server Action lançando uma
// exceção especial com "digest" a começar por "NEXT_REDIRECT". Isto NUNCA
// deve ser tratado como um erro real — apenas relançado para o Next.js
// completar a navegação.
function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export default function ListingEditForm({
  userId,
  listing,
  images,
}: {
  userId: string;
  listing: Listing;
  images: ListingImage[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const imagesRef = useRef<ImageUploadFieldRef>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [values, setValues] = useState<ListingFieldValues>({
    title: listing.title,
    description: listing.description,
    price: String(listing.price),
    category: listing.category,
    city: listing.city,
    whatsapp: listing.whatsapp,
  });
  const { showToast } = useToast();

  const visibleImages = images.filter((image) => !removedIds.includes(image.id));
  const remainingSlots = Math.max(0, 5 - visibleImages.length);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current || pending) return;

    setPending(true);
    setError(null);

    const formData = new FormData(formRef.current);
    const files = imagesRef.current?.getFiles() ?? [];
    const supabase = createClient();
    const uploadedPaths: string[] = [];

    console.log("[updateListing] início", { listingId: listing.id, totalFicheiros: files.length });

    try {
      for (const [i, file] of files.entries()) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${listing.id}/${crypto.randomUUID()}.${extension}`;

        console.log(`[upload ${i + 1}/${files.length}] a enviar`, {
          path,
          tipo: file.type,
          tamanhoBytes: file.size,
        });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("listings")
          .upload(path, file, { contentType: file.type });

        if (uploadError) {
          console.error(`[upload ${i + 1}/${files.length}] FALHOU`, {
            path,
            mensagem: uploadError.message,
            erroCompleto: uploadError,
          });
          showToast(
            "error",
            `Falha no upload da foto ${i + 1}/${files.length}`,
            uploadError.message
          );
          throw new Error(`Não foi possível enviar a foto ${i + 1}: ${uploadError.message}`);
        }

        console.log(`[upload ${i + 1}/${files.length}] sucesso`, uploadData);

        uploadedPaths.push(path);

        const { data: publicUrlData } = supabase.storage.from("listings").getPublicUrl(path);

        if (!publicUrlData?.publicUrl) {
          console.error(`[getPublicUrl ${i + 1}/${files.length}] devolveu vazio`, { path });
          showToast("error", `Não foi possível gerar o link da foto ${i + 1}`, path);
          throw new Error(`Não foi possível gerar o link público da foto ${i + 1}.`);
        }

        console.log(`[getPublicUrl ${i + 1}/${files.length}]`, publicUrlData.publicUrl);

        formData.append("imageUrls", publicUrlData.publicUrl);
      }

      removedIds.forEach((id) => formData.append("removedImages", id));

      console.log("[updateListing] a chamar a Server Action", {
        listingId: listing.id,
        novasImageUrls: formData.getAll("imageUrls"),
        removedIds,
      });

      const result = await updateListing(formData);

      if (result?.error) {
        console.error("[updateListing] Server Action devolveu erro", result.error);
        showToast("error", "Erro ao guardar alterações", result.error);
        setError(result.error);
        if (result.values) {
          setValues(result.values);
        }
        setPending(false);
      }
      // Em caso de sucesso, updateListing() chama redirect() e a navegação
      // é tratada automaticamente pelo Next.js.
    } catch (err) {
      // Nunca tratar um redirect bem-sucedido (lançado pelo Next.js a
      // partir da Server Action) como um erro de upload/atualização.
      if (isNextRedirectError(err)) {
        throw err;
      }

      console.error("[updateListing] exceção capturada", err);

      if (uploadedPaths.length > 0) {
        console.log("[updateListing] a limpar imagens já enviadas", uploadedPaths);
        const { error: removeError } = await supabase.storage
          .from("listings")
          .remove(uploadedPaths);

        if (removeError) {
          console.error("[updateListing] falha ao limpar imagens", removeError);
        }
      }

      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível guardar as alterações. Tente novamente.";

      showToast("error", "Não foi possível guardar as alterações", message);
      setError(message);
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="listingId" value={listing.id} />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fotos atuais</label>

          {visibleImages.length === 0 ? (
            <p className="text-xs text-gray-400">Todas as fotos atuais serão removidas.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {visibleImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-100"
                >
                  <TrackedImage src={image.image_url} alt="" fill unoptimized sizes="120px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setRemovedIds((prev) => [...prev, image.id])}
                    aria-label="Remover foto"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ListingFields defaults={values} />

      <ImageUploadField ref={imagesRef} maxImages={remainingSlots} onError={setError} />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "A guardar..." : "Guardar alterações"}
      </button>
    </form>
  );
}
