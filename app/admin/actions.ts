"use server";

import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteListingWithImages } from "@/lib/listing-deletion";

const VALID_TABS = ["pending", "approved", "rejected", "all"];

async function ensureAdmin() {
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

  return supabase;
}

function adminAnunciosHref(formData: FormData): string {
  const status = String(formData.get("status") ?? "pending").trim();
  const page = Math.max(1, Number.parseInt(String(formData.get("page") ?? "1"), 10) || 1);

  const sp = new URLSearchParams();
  if (VALID_TABS.includes(status) && status !== "pending") sp.set("status", status);
  if (page > 1) sp.set("page", String(page));

  const qs = sp.toString();
  return qs ? `/admin/anuncios?${qs}` : "/admin/anuncios";
}

function revalidateListingPaths(listingId: string) {
  revalidatePath("/");
  revalidatePath("/anuncios");
  revalidatePath("/meus-anuncios");
  revalidatePath("/admin");
  revalidatePath("/admin/anuncios");
  revalidatePath(`/anuncios/${listingId}`);
}

export async function approveListing(formData: FormData) {
  const supabase = await ensureAdmin();
  const listingId = String(formData.get("listingId") ?? "").trim();

  await supabase.rpc("admin_set_listing_status", {
    p_listing_id: listingId,
    p_status: "approved",
    p_reason: null,
  });

  revalidateListingPaths(listingId);
  redirect(adminAnunciosHref(formData));
}

export async function rejectListing(formData: FormData) {
  const supabase = await ensureAdmin();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200) || null;

  await supabase.rpc("admin_set_listing_status", {
    p_listing_id: listingId,
    p_status: "rejected",
    p_reason: reason,
  });

  revalidateListingPaths(listingId);
  redirect(adminAnunciosHref(formData));
}

export async function adminDeleteListing(formData: FormData) {
  const supabase = await ensureAdmin();
  const listingId = String(formData.get("listingId") ?? "").trim();

  await deleteListingWithImages(supabase, listingId);

  revalidateListingPaths(listingId);
  redirect(adminAnunciosHref(formData));
}
