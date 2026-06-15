import { CATEGORIES, MOZAMBIQUE_CITIES, SORT_OPTIONS } from "@/lib/constants";

const inputClass =
  "w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function SearchFilters({
  q,
  categoria,
  cidade,
  ordenar,
}: {
  q: string;
  categoria: string;
  cidade: string;
  ordenar: string;
}) {
  return (
    <form action="/anuncios" method="get" className="space-y-3">
      <div>
        <label htmlFor="q" className="sr-only">
          Pesquisar
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="O que está a procurar?"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-1">
          <label htmlFor="categoria" className="sr-only">
            Categoria
          </label>
          <select id="categoria" name="categoria" defaultValue={categoria} className={inputClass}>
            <option value="">Todas as categorias</option>
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label htmlFor="cidade" className="sr-only">
            Cidade
          </label>
          <select id="cidade" name="cidade" defaultValue={cidade} className={inputClass}>
            <option value="">Todas as cidades</option>
            {MOZAMBIQUE_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label htmlFor="ordenar" className="sr-only">
            Ordenar por
          </label>
          <select id="ordenar" name="ordenar" defaultValue={ordenar} className={inputClass}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="col-span-1 rounded-md bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark"
        >
          Pesquisar
        </button>
      </div>
    </form>
  );
}
