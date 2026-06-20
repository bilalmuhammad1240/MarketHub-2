import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const { error, success } = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, phone, city, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-600">
          Não foi possível carregar o seu perfil. Tente novamente mais tarde.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold text-primary-dark">O meu perfil</h1>
      <p className="mt-1 text-sm text-gray-500">
        Estes dados aparecem nos seus anúncios.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-primary-dark">
          Perfil atualizado com sucesso.
        </div>
      )}

      <div className="mt-6">
        <ProfileForm profile={profile as Profile} />
      </div>
    </main>
  );
}
