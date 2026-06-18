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
  { name: "Veículos", slug: "veiculos" },
  { name: "Imóveis", slug: "imoveis" },
  { name: "Eletrónicos", slug: "eletronicos" },
  { name: "Serviços", slug: "servicos" },
  { name: "Empregos", slug: "empregos" },
  { name: "Moda", slug: "moda" },
  { name: "Agricultura", slug: "agricultura" },
  { name: "Educação", slug: "educacao" },
] as const;

// Opções de ordenação da página de pesquisa (especificação, seção 5.3).
export const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco_asc", label: "Preço: menor para maior" },
  { value: "preco_desc", label: "Preço: maior para menor" },
] as const;
