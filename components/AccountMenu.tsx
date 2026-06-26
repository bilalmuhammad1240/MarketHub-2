"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/auth/actions";

export default function AccountMenu({
  displayName,
  isAdmin,
}: {
  displayName: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Altura fixa h-9 garante que o trigger nunca muda o tamanho do header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 items-center gap-1.5 rounded-md pl-2 pr-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-dark">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[100px] truncate sm:block">{displayName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* position:absolute com top/right — flutua fora do fluxo, nunca empurra conteúdo */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
        >
          <Link
            href="/perfil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <span className="text-base">👤</span> O meu perfil
          </Link>
          <Link
            href="/meus-anuncios"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <span className="text-base">📋</span> Os meus anúncios
          </Link>
          {isAdmin && (
            <>
              <div className="my-1 border-t border-gray-100" />
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="text-base">🛠️</span> Painel admin
              </Link>
              <Link
                href="/admin/configuracoes"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="text-base">⚙️</span> Configurações
              </Link>
            </>
          )}
          <div className="my-1 border-t border-gray-100" />
          <form action={logout} role="none">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <span className="text-base">🚪</span> Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
