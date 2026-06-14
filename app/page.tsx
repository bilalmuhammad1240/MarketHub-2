export default function Home() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-primary-dark">MozMarketHub</h1>
      <p className="mt-2 text-base text-gray-600">
        Compre, venda e anuncie em Moçambique.
      </p>

      <div className="mt-8 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 text-left text-sm">
        <p className="font-semibold text-gray-800">Estado da base do projeto</p>
        <ul className="mt-2 space-y-1 text-gray-600">
          <li>✅ Next.js 15 + Tailwind configurados</li>
          <li>
            {supabaseConfigured ? "✅" : "⚠️"} Variáveis do Supabase{" "}
            {supabaseConfigured ? "configuradas" : "não configuradas"}
          </li>
        </ul>
        {!supabaseConfigured && (
          <p className="mt-3 text-xs text-gray-500">
            Copie .env.local.example para .env.local e preencha as suas
            credenciais do Supabase.
          </p>
        )}
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Módulo 1 concluído. Pronto para o Módulo 2 — Autenticação.
      </p>
    </main>
  );
}
