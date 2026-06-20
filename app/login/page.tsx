import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import QueryErrorToast from "@/components/QueryErrorToast";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const { error, next } = await searchParams;

  if (data.user) {
    redirect(next && next.startsWith("/") ? next : "/");
  }

  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-6 py-12">
      <QueryErrorToast title="Erro ao entrar" message={error} />

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-gray-800">Entrar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acede à sua conta MozMarketHub
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={login} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem conta?{" "}
          <Link
            href={next ? `/registo?next=${encodeURIComponent(next)}` : "/registo"}
            className="font-semibold text-primary-dark hover:underline"
          >
            Registe-se
          </Link>
        </p>
      </div>
    </main>
  );
}
