import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-gray-800">Link inválido ou expirado</h1>
      <p className="mt-2 max-w-sm text-gray-600">
        O link de confirmação não é válido ou já expirou. Tente entrar ou
        registe-se novamente.
      </p>
      <Link
        href="/login"
        className="mt-6 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Voltar para o login
      </Link>
    </main>
  );
}
