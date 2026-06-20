"use client";

import { useEffect } from "react";

// Next.js App Router: este ficheiro apanha erros não tratados durante a
// renderização em qualquer parte da árvore abaixo do layout raiz, e
// mostra a mensagem diretamente na tela (em vez do ecrã genérico
// "Application error" sem detalhe).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError] erro não tratado capturado", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="pt-MZ">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-bold text-red-700">Ocorreu um erro</h1>
          <div className="w-full max-w-md rounded-md border border-red-200 bg-red-50 p-4 text-left text-sm text-red-800">
            <p className="font-semibold">Mensagem:</p>
            <p className="mt-1 break-words font-mono text-xs">{error.message}</p>
            {error.digest && (
              <>
                <p className="mt-3 font-semibold">Digest:</p>
                <p className="mt-1 break-words font-mono text-xs">{error.digest}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
