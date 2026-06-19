"use client";

import { useState } from "react";
import { deleteListing } from "@/app/anuncios/[id]/editar/actions";

export default function DeleteListingButton({ listingId }: { listingId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Eliminar
      </button>
    );
  }

  return (
    <form action={deleteListing} className="flex flex-col gap-1.5">
      <input type="hidden" name="listingId" value={listingId} />
      <button
        type="submit"
        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
      >
        Confirmar
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        Cancelar
      </button>
    </form>
  );
}
