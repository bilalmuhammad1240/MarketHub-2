"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (!name || !phone || !city) {
    redirect("/perfil?error=" + encodeURIComponent("Preencha todos os campos."));
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name, phone, city })
    .eq("id", user.id);

  if (error) {
    redirect(
      "/perfil?error=" +
        encodeURIComponent("Não foi possível guardar as alterações. Tente novamente.")
    );
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  redirect("/perfil?success=1");
}
