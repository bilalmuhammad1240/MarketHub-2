"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateListing } from "./actions";
import ListingFields, { type ListingFieldValues } from "@/components/ListingFields";
import ImageUploadField, { type ImageUploadFieldRef } from "@/components/ImageUploadField";
import type { Listing, ListingImage } from "@/lib/types";

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

    try {
      for (const file of files) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${listing.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(path, file, { contentType: file.type });

        if (uploadError) {
          throw new Error("Não foi possível enviar uma das fotos. Tente novamente.");
        }

        uploadedPaths.push(path);

        const { data: publicUrlData } = supabase.storage.from("listings").getPublicUrl(path);
        formData.append("imageUrls", publicUrlData.publicUrl);
      }

      removedIds.forEach((id) => formData.append("removedImages", id));

      const result = await updateListing(formData);

      if (result?.error) {
        setError(result.error);
        if (result.values) {
          setValues(result.values);
        }
        setPending(false);
      }
      // Em caso de sucesso, updateListing() chama redirect() e a navegação
      // é tratada automaticamente pelo Next.js.
    } catch (err) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("listings").remove(uploadedPaths);
      }

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível guardar as alterações. Tente novamente."
      );
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
                  <Image src={image.image_url} alt="" fill unoptimized sizes="120px" className="object-cover" />
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
