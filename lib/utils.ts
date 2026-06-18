import { CATEGORIES } from "./constants";

// Formata um preço em Meticais, ex: 1500 -> "1.500 MT".
export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat("pt-PT", {
    maximumFractionDigits: 0,
  }).format(price);

  return `${formatted} MT`;
}

// Devolve o nome legível de uma categoria a partir do seu slug.
export function getCategoryName(slug: string): string {
  return CATEGORIES.find((category) => category.slug === slug)?.name ?? slug;
}

// Normaliza um número de telefone moçambicano para o formato
// internacional usado pelo WhatsApp (apenas dígitos, com código de país).
// Exemplos: "84 123 4567" -> "258841234567", "+258821234567" -> "258821234567"
export function normalizeWhatsapp(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("258")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length === 9) {
    return `258${digits}`;
  }

  return digits;
}

// Valida se um número, depois de normalizado, corresponde ao formato
// de um número de celular moçambicano (258 + 8XXXXXXXX).
export function isValidMozambiquePhone(phone: string): boolean {
  return /^2588\d{8}$/.test(normalizeWhatsapp(phone));
}

// Gera o link "wa.me" com uma mensagem pré-preenchida.
export function whatsappLink(phone: string, message: string): string {
  const normalized = normalizeWhatsapp(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

// Extrai o caminho relativo (dentro do bucket) a partir de um URL
// público do Supabase Storage. Necessário para apagar ficheiros.
// Ex: ".../storage/v1/object/public/listings/abc/123.jpg" -> "abc/123.jpg"
export function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return url.slice(index + marker.length);
}

// Limpa um termo de pesquisa antes de o usar num filtro ilike/or() do
// PostgREST: remove caracteres que têm significado especial nesse
// formato (",", "(", ")") e os caracteres-wildcard do ILIKE ("%", "_"),
// e limita o tamanho.
export function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()%_]/g, " ").trim().slice(0, 100);
}

