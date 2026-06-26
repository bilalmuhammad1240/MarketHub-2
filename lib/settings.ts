import { createClient } from "./supabase/server";

export type SiteSettings = {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  banner_url: string;
  banner_heading: string;
  banner_subtext: string;
  contact_email: string;
  contact_whatsapp: string;
};

const DEFAULTS: SiteSettings = {
  site_name: "MozMarketHub",
  site_tagline: "Compre, venda e anuncie em Moçambique",
  logo_url: "",
  banner_url: "",
  banner_heading: "Compre, venda e anuncie em Moçambique",
  banner_subtext:
    "Produtos, serviços, veículos, casas e empregos — tudo num só lugar.",
  contact_email: "",
  contact_whatsapp: "",
};

// Lê todas as configurações do site a partir da tabela "site_settings".
// Nunca lança exceção — devolve os valores padrão em caso de erro.
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) {
      console.error("[getSiteSettings] erro", {
        code: error.code,
        message: error.message,
      });
      return DEFAULTS;
    }

    const map = Object.fromEntries(
      (data ?? []).map((row: { key: string; value: string }) => [row.key, row.value])
    );

    return {
      site_name: map.site_name || DEFAULTS.site_name,
      site_tagline: map.site_tagline || DEFAULTS.site_tagline,
      logo_url: map.logo_url || DEFAULTS.logo_url,
      banner_url: map.banner_url || DEFAULTS.banner_url,
      banner_heading: map.banner_heading || DEFAULTS.banner_heading,
      banner_subtext: map.banner_subtext || DEFAULTS.banner_subtext,
      contact_email: map.contact_email || DEFAULTS.contact_email,
      contact_whatsapp: map.contact_whatsapp || DEFAULTS.contact_whatsapp,
    };
  } catch {
    return DEFAULTS;
  }
}
