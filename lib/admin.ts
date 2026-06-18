import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// Garante que apenas administradores acessam as páginas /admin/*.
// - Não autenticado -> /login
// - Autenticado mas sem role "admin" -> 404 (não revela a existência da
//   área de administração a utilizadores comuns)
export async function requireAdmin(): Promise<{ user: User }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    notFound();
  }

  // user é garantidamente não-nulo aqui (o redirect acima lança exceção)
  return { user: user as User };
}
