"use client";

import { useEffect, useRef } from "react";
import { useToast } from "./Toast";

// Mostra um erro vindo de um redirect do servidor (ex: ?imageError=...)
// como toast assim que a página carrega. Usado quando uma Server Action
// falha parcialmente após já ter feito redirect (ex: anúncio criado mas
// fotos não guardadas).
export default function QueryErrorToast({
  title,
  message,
}: {
  title: string;
  message: string | null | undefined;
}) {
  const { showToast } = useToast();
  const shown = useRef(false);

  useEffect(() => {
    if (message && !shown.current) {
      shown.current = true;
      console.error(`[QueryErrorToast] ${title}`, message);
      showToast("error", title, message);
    }
  }, [message, title, showToast]);

  return null;
}
