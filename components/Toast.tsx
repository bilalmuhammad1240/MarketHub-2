"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastKind = "error" | "info" | "success";

type Toast = {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
};

type ToastContextValue = {
  showToast: (kind: ToastKind, title: string, detail?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (kind: ToastKind, title: string, detail?: string) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, kind, title, detail }]);

      // Erros ficam mais tempo na tela (15s) que info/success (6s), para
      // dar tempo de ler e copiar a mensagem de debug.
      const duration = kind === "error" ? 15000 : 6000;
      timers.current[id] = setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto w-full max-w-sm rounded-lg border p-3 text-sm shadow-lg ${
              toast.kind === "error"
                ? "border-red-300 bg-red-50 text-red-800"
                : toast.kind === "success"
                  ? "border-green-300 bg-green-50 text-primary-dark"
                  : "border-gray-300 bg-white text-gray-800"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{toast.title}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Fechar"
                className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
            {toast.detail && (
              <p className="mt-1 break-words font-mono text-xs opacity-80">{toast.detail}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }

  return ctx;
}
