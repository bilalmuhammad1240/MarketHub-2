"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "site-assets";

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login?next=/admin/configuracoes");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/admin");

  return supabase;
}

async function upsertSetting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string,
  value: string
) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    console.error(`[saveSettings] erro a guardar '${key}'`, {
      code: error.code,
      message: error.message,
    });
  }
}

// Guarda os campos de texto das configurações (nome, tagline, banner
// heading, banner subtext, contactos).
export async function saveTextSettings(formData: FormData) {
  const supabase = await ensureAdmin();

  const fields: Record<string, string> = {
    site_name:        String(formData.get("site_name") ?? "").trim(),
    site_tagline:     String(formData.get("site_tagline") ?? "").trim(),
    banner_heading:   String(formData.get("banner_heading") ?? "").trim(),
    banner_subtext:   String(formData.get("banner_subtext") ?? "").trim(),
    contact_email:    String(formData.get("contact_email") ?? "").trim(),
    contact_whatsapp: String(formData.get("contact_whatsapp") ?? "").trim(),
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value) await upsertSetting(supabase, key, value);
  }

  revalidatePath("/", "layout");
  redirect("/admin/configuracoes?success=1");
}

// Faz upload do logo e guarda o URL público.
export async function uploadLogo(formData: FormData) {
  const supabase = await ensureAdmin();

  const file = formData.get("logo") as File | null;

  if (!file || file.size === 0) {
    redirect("/admin/configuracoes?error=" + encodeURIComponent("Selecione um ficheiro de logo."));
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `logo/logo-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("[uploadLogo] erro", { code: uploadError.message });
    redirect("/admin/configuracoes?error=" + encodeURIComponent("Erro ao carregar o logo: " + uploadError.message));
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  await upsertSetting(supabase, "logo_url", urlData.publicUrl);

  revalidatePath("/", "layout");
  redirect("/admin/configuracoes?success=1");
}

// Faz upload do banner e guarda o URL público.
export async function uploadBanner(formData: FormData) {
  const supabase = await ensureAdmin();

  const file = formData.get("banner") as File | null;

  if (!file || file.size === 0) {
    redirect("/admin/configuracoes?error=" + encodeURIComponent("Selecione um ficheiro de banner."));
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `banner/banner-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("[uploadBanner] erro", { message: uploadError.message });
    redirect("/admin/configuracoes?error=" + encodeURIComponent("Erro ao carregar o banner: " + uploadError.message));
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  await upsertSetting(supabase, "banner_url", urlData.publicUrl);

  revalidatePath("/", "layout");
  redirect("/admin/configuracoes?success=1");
}

// Remove o logo ou banner atual.
export async function clearAsset(formData: FormData) {
  const supabase = await ensureAdmin();

  const key = String(formData.get("key") ?? "").trim();

  if (key !== "logo_url" && key !== "banner_url") {
    redirect("/admin/configuracoes");
  }

  await upsertSetting(supabase, key, "");

  revalidatePath("/", "layout");
  redirect("/admin/configuracoes?success=1");
}
