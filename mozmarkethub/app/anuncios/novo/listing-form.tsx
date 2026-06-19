"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "./actions";
import ListingFields, { type ListingFieldValues } from "@/components/ListingFields";
import ImageUploadField, { type ImageUploadFieldRef } from "@/components/ImageUploadField";

const EMPTY_VALUES: ListingFieldValues = {
  title: "",
  description: "",
  price: "",
  category: "",
  city: "",
  whatsapp: "",
};

export default function ListingForm({
  userId,
  defaultWhatsapp,
}: {
  userId: string;
  defaultWhatsapp: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const imagesRef = useRef<ImageUploadFieldRef>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<ListingFieldValues>({
    ...EMPTY_VALUES,
    whatsapp: defaultWhatsapp,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current || pending) return;

    setPending(true);
    setError(null);

    const formData = new FormData(formRef.current);
    const files = imagesRef.current?.getFiles() ?? [];
    const listingId = crypto.randomUUID();
    const supabase = createClient();
    const uploadedPaths: string[] = [];

    try {
      for (const file of files) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${listingId}/${crypto.randomUUID()}.${extension}`;

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

      formData.set("id", listingId);

      const result = await createListing(formData);

      if (result?.error) {
        setError(result.error);
        if (result.values) {
          setValues(result.values);
        }
        setPending(false);
      }
      // Em caso de sucesso, createListing() chama redirect() e a navegação
      // é tratada automaticamente pelo Next.js.
    } catch (err) {
      // Limpa as imagens já enviadas se algo correr mal antes de criar o anúncio.
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("listings").remove(uploadedPaths);
      }

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível publicar o anúncio. Tente novamente."
      );
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ListingFields defaults={values} />

      <ImageUploadField ref={imagesRef} onError={setError} />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "A publicar..." : "Publicar anúncio"}
      </button>
    </form>
  );
}
