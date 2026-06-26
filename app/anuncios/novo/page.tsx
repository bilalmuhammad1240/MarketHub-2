import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "./listing-form";

export const dynamic = "force-dynamic";

export default async function NovoAnuncioPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/anuncios/novo");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto min-h-[calc(100vh-56px)] max-w-lg px-6 py-8">
      <h1 className="text-2xl font-bold text-primary-dark">Publicar anúncio</h1>
      <p className="mt-1 text-sm text-gray-500">
        Depois de publicado, o seu anúncio fica em revisão antes de aparecer
        para todos.
      </p>

      <div className="mt-6">
        <ListingForm userId={user.id} defaultWhatsapp={profile?.phone ?? ""} />
      </div>
    </main>
  );
}
