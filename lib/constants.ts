// Cidades principais de Moçambique, usadas no registo de utilizador
// e (no Módulo 3) no formulário de anúncio e filtros de pesquisa.
export const MOZAMBIQUE_CITIES = [
  "Maputo",
  "Matola",
  "Beira",
  "Nampula",
  "Chimoio",
  "Nacala",
  "Quelimane",
  "Tete",
  "Xai-Xai",
  "Maxixe",
  "Pemba",
  "Lichinga",
  "Inhambane",
  "Cuamba",
  "Dondo",
  "Outra",
] as const;

// Categorias padrão de anúncios (especificação, seção 6.4).
export const CATEGORIES = [
  { name: "Veículos",    slug: "veiculos",    icon: "🚗" },
  { name: "Imóveis",     slug: "imoveis",     icon: "🏠" },
  { name: "Eletrónicos", slug: "eletronicos", icon: "📱" },
  { name: "Serviços",    slug: "servicos",    icon: "🔧" },
  { name: "Empregos",    slug: "empregos",    icon: "💼" },
  { name: "Moda",        slug: "moda",        icon: "👗" },
  { name: "Agricultura", slug: "agricultura", icon: "🌱" },
  { name: "Educação",    slug: "educacao",    icon: "📚" },
] as const;

// Opções de ordenação da página de pesquisa (especificação, seção 5.3).
export const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco_asc", label: "Preço: menor para maior" },
  { value: "preco_desc", label: "Preço: maior para menor" },
] as const;
