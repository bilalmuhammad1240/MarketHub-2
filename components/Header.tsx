import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import AccountMenu from "@/components/AccountMenu";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let displayName: string | null = null;
  let isAdmin = false;

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[Header/server] erro ao procurar perfil", {
        userId: user.id,
        code: profileError.code,
        message: profileError.message,
      });
    }

    displayName = profile?.name ?? user.email ?? "Conta";
    isAdmin = profile?.role === "admin";
  }

  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      {/* h-14 fixo — nunca muda de altura independentemente do conteúdo */}
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {settings.logo_url ? (
            /* Dimensões explícitas reservam espaço antes da imagem carregar */
            <div className="relative h-8 w-[100px] shrink-0">
              <Image
                src={settings.logo_url}
                alt={settings.site_name}
                fill
                unoptimized
                priority
                className="object-contain object-left"
              />
            </div>
          ) : (
            <span className="text-lg font-bold text-primary-dark">
              {settings.site_name}
            </span>
          )}
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/anuncios"
            aria-label="Pesquisar anúncios"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary-dark"
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
              <Link
                href="/anuncios/novo"
                className="shrink-0 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark sm:text-sm"
              >
                Publicar
              </Link>
              <AccountMenu displayName={displayName ?? "Conta"} isAdmin={isAdmin} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="shrink-0 px-2 text-sm font-medium text-gray-700 hover:text-primary-dark"
              >
                Entrar
              </Link>
              <Link
                href="/registo"
                className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
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

