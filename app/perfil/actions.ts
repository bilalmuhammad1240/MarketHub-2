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

  console.log("[updateProfile/server] a guardar", { userId: user.id, name, phone, city });

  const { error } = await supabase
    .from("profiles")
    .update({ name, phone, city })
    .eq("id", user.id);

  if (error) {
    console.error("[updateProfile/server] erro ao atualizar 'profiles'", {
      userId: user.id,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    redirect(
      "/perfil?error=" +
        encodeURIComponent(
          `Não foi possível guardar as alterações (${error.code ?? "erro"}): ${error.message}`
        )
    );
  }

  console.log("[updateProfile/server] sucesso", { userId: user.id });

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  redirect("/perfil?success=1");
}
