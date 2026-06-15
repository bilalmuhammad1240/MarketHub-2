import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let displayName: string | null = null;
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    displayName = profile?.name ?? user.email ?? "Conta";
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-primary-dark">
          MozMarketHub
        </Link>

        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/anuncios"
            aria-label="Pesquisar anúncios"
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary-dark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>

          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-md border border-primary-dark px-3 py-2 text-xs font-semibold text-primary-dark hover:bg-primary-dark hover:text-white sm:text-sm"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/anuncios/novo"
                className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark sm:text-sm"
              >
                Publicar
              </Link>
              <Link
                href="/perfil"
                className="max-w-[64px] truncate text-xs font-medium text-gray-700 hover:text-primary-dark sm:max-w-[120px] sm:text-sm"
              >
                {displayName}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-gray-700 hover:text-primary-dark"
              >
                Entrar
              </Link>
              <Link
                href="/registo"
                className="rounded-md bg-primary px-3 py-2 font-semibold text-white hover:bg-primary-dark"
              >
                Registar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
