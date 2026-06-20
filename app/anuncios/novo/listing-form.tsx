"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "./actions";
import ListingFields, { type ListingFieldValues } from "@/components/ListingFields";
import ImageUploadField, { type ImageUploadFieldRef } from "@/components/ImageUploadField";
import { useToast } from "@/components/Toast";

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
  const { showToast } = useToast();

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

    console.log("[createListing] início", { listingId, totalFicheiros: files.length });

    try {
      for (const [i, file] of files.entries()) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${listingId}/${crypto.randomUUID()}.${extension}`;

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

      formData.set("id", listingId);

      console.log("[createListing] a chamar a Server Action", {
        listingId,
        imageUrls: formData.getAll("imageUrls"),
      });

      const result = await createListing(formData);

      if (result?.error) {
        console.error("[createListing] Server Action devolveu erro", result.error);
        showToast("error", "Erro ao publicar anúncio", result.error);
        setError(result.error);
        if (result.values) {
          setValues(result.values);
        }
        setPending(false);
      }
      // Em caso de sucesso, createListing() chama redirect() e a navegação
      // é tratada automaticamente pelo Next.js.
    } catch (err) {
      // Nunca tratar um redirect bem-sucedido (lançado pelo Next.js a
      // partir da Server Action) como um erro de upload/publicação.
      if (isNextRedirectError(err)) {
        throw err;
      }

      console.error("[createListing] exceção capturada", err);

      // Limpa as imagens já enviadas se algo correr mal antes de criar o anúncio.
      if (uploadedPaths.length > 0) {
        console.log("[createListing] a limpar imagens já enviadas", uploadedPaths);
        const { error: removeError } = await supabase.storage
          .from("listings")
          .remove(uploadedPaths);

        if (removeError) {
          console.error("[createListing] falha ao limpar imagens", removeError);
        }
      }

      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível publicar o anúncio. Tente novamente.";

      showToast("error", "Não foi possível publicar o anúncio", message);
      setError(message);
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
