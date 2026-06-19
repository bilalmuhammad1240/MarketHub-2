import { CATEGORIES, MOZAMBIQUE_CITIES } from "@/lib/constants";

export type ListingFieldValues = {
  title: string;
  description: string;
  price: string;
  category: string;
  city: string;
  whatsapp: string;
};

const inputClass =
  "w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function ListingFields({ defaults }: { defaults: ListingFieldValues }) {
  return (
    <>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          placeholder="Ex: iPhone 12 64GB"
          defaultValue={defaults.title}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          maxLength={1000}
          placeholder="Descreva o produto ou serviço: estado, detalhes, condições..."
          defaultValue={defaults.description}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-gray-700">
            Preço (MT)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            required
            placeholder="0"
            defaultValue={defaults.price}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={defaults.category}
            className={inputClass}
          >
            <option value="" disabled>
              Selecione
            </option>
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
          Cidade
        </label>
        <select
          id="city"
          name="city"
          required
          defaultValue={defaults.city}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione a cidade
          </option>
          {MOZAMBIQUE_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-gray-700">
          WhatsApp
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          required
          placeholder="84xxxxxxx"
          defaultValue={defaults.whatsapp}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-400">
          Os compradores vão contactá-lo por este número.
        </p>
      </div>
    </>
  );
}
