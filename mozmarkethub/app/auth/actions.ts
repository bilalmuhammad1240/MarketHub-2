"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Traduz as mensagens de erro mais comuns do Supabase Auth para português.
function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    "User already registered": "Este email já está registado. Tente entrar.",
    "Password should be at least 6 characters.":
      "A password deve ter pelo menos 6 caracteres.",
    "Unable to validate email address: invalid format":
      "Formato de email inválido.",
    "Invalid login credentials": "Email ou password incorretos.",
  };

  return map[message] ?? "Não foi possível concluir o pedido. Tente novamente.";
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();
  const safeNext = next.startsWith("/") ? next : "";

  if (!email || !password) {
    const params = new URLSearchParams({ error: "Preencha o email e a password." });
    if (safeNext) params.set("next", safeNext);
    redirect(`/login?${params.toString()}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const params = new URLSearchParams({ error: translateAuthError(error.message) });
    if (safeNext) params.set("next", safeNext);
    redirect(`/login?${params.toString()}`);
  }

  revalidatePath("/", "layout");
  redirect(safeNext || "/");
}

export async function signup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const next = String(formData.get("next") ?? "").trim();
  const safeNext = next.startsWith("/") ? next : "";

  if (!name || !email || !phone || !city || !password) {
    const params = new URLSearchParams({ error: "Preencha todos os campos." });
    if (safeNext) params.set("next", safeNext);
    redirect(`/registo?${params.toString()}`);
  }

  if (password.length < 6) {
    const params = new URLSearchParams({
      error: "A password deve ter pelo menos 6 caracteres.",
    });
    if (safeNext) params.set("next", safeNext);
    redirect(`/registo?${params.toString()}`);
  }

  if (password !== confirmPassword) {
    const params = new URLSearchParams({ error: "As passwords não coincidem." });
    if (safeNext) params.set("next", safeNext);
    redirect(`/registo?${params.toString()}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, city },
    },
  });

  if (error) {
    const params = new URLSearchParams({ error: translateAuthError(error.message) });
    if (safeNext) params.set("next", safeNext);
    redirect(`/registo?${params.toString()}`);
  }

  // Se a confirmação de email estiver desativada no projeto Supabase,
  // o signUp já devolve uma sessão ativa — entra diretamente.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(safeNext || "/");
  }

  redirect(`/registo/confirmar${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
