import Link from "next/link";

export default async function ConfirmarRegistoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "";
  const loginHref = safeNext ? `/login?next=${encodeURIComponent(safeNext)}` : "/login";

  return (
    <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-primary-dark">Confirme o seu email</h1>
      <p className="mt-3 max-w-sm text-gray-600">
        Enviámos um link de confirmação para o seu email. Abra a sua caixa de
        entrada e clique no link para ativar a sua conta.
      </p>
      <Link href={loginHref} className="mt-6 font-semibold text-primary-dark hover:underline">
        Voltar para o login
      </Link>
    </main>
  );
}
