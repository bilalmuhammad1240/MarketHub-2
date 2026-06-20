"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { useToast } from "./Toast";

// Substituto "drop-in" de next/image que apanha falhas de carregamento
// (URL inválido, 400/403/404 do Storage, bloqueio de host, etc.) e
// mostra-as como toast na tela + console.error, em vez de falhar em
// silêncio com uma caixa vazia.
export default function TrackedImage(props: ImageProps) {
  const { showToast } = useToast();
  const [failed, setFailed] = useState(false);
  const src = typeof props.src === "string" ? props.src : String(props.src);

  if (failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-red-50 p-2 text-center text-[10px] text-red-600 ${props.className ?? ""}`}
        style={props.fill ? { position: "absolute", inset: 0 } : undefined}
      >
        Erro ao carregar imagem
      </div>
    );
  }

  return (
    <Image
      {...props}
      onError={(event) => {
        console.error("TrackedImage: falha ao carregar imagem", {
          src,
          event,
        });
        showToast("error", "Erro ao carregar imagem", src);
        setFailed(true);
        props.onError?.(event);
      }}
    />
  );
}
