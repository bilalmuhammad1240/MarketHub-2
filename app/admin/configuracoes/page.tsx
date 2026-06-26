import Image from "next/image";
import { getSiteSettings } from "@/lib/settings";
import QueryErrorToast from "@/components/QueryErrorToast";
import {
  saveTextSettings,
  uploadLogo,
  uploadBanner,
  clearAsset,
} from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const s = await getSiteSettings();

  return (
    <div className="max-w-2xl space-y-8">
      <QueryErrorToast title="Erro nas configurações" message={error} />

      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Personalize a aparência e informações da plataforma.
        </p>
      </div>

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-primary-dark">
          Configurações guardadas com sucesso.
        </div>
      )}

      {/* ── LOGO ────────────────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-800">Logo</h2>
        <p className="mt-1 text-xs text-gray-500">
          Aparece no cabeçalho da plataforma. Recomendado: PNG transparente,
          mínimo 200×80 px.
        </p>

        {s.logo_url ? (
          <div className="mt-4 flex items-center gap-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <Image
                src={s.logo_url}
                alt="Logo atual"
                width={120}
                height={48}
                unoptimized
                className="h-12 w-auto object-contain"
              />
            </div>
            <form action={clearAsset}>
              <input type="hidden" name="key" value="logo_url" />
              <button
                type="submit"
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Remover logo
              </button>
            </form>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-400">Nenhum logo configurado.</p>
        )}

        <form action={uploadLogo} encType="multipart/form-data" className="mt-4 space-y-3">
          <div>
            <label htmlFor="logo" className="mb-1 block text-sm font-medium text-gray-700">
              {s.logo_url ? "Substituir logo" : "Carregar logo"}
            </label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              required
              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-dark hover:file:bg-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Carregar logo
          </button>
        </form>
      </section>

      {/* ── BANNER ──────────────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-800">Banner / Imagem de fundo</h2>
        <p className="mt-1 text-xs text-gray-500">
          Imagem de fundo da secção hero da página inicial.
          Recomendado: JPG ou PNG, 1440×600 px.
        </p>

        {s.banner_url ? (
          <div className="mt-4 space-y-3">
            <div className="relative h-28 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-100">
              <Image
                src={s.banner_url}
                alt="Banner atual"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <form action={clearAsset}>
              <input type="hidden" name="key" value="banner_url" />
              <button
                type="submit"
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Remover banner
              </button>
            </form>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-400">Nenhum banner configurado.</p>
        )}

        <form action={uploadBanner} encType="multipart/form-data" className="mt-4 space-y-3">
          <div>
            <label htmlFor="banner" className="mb-1 block text-sm font-medium text-gray-700">
              {s.banner_url ? "Substituir banner" : "Carregar banner"}
            </label>
            <input
              id="banner"
              name="banner"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required
              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-dark hover:file:bg-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Carregar banner
          </button>
        </form>
      </section>

      {/* ── TEXTOS ──────────────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-800">Textos da plataforma</h2>
        <p className="mt-1 text-xs text-gray-500">
          Nome do site, slogan e texto do banner principal.
        </p>

        <form action={saveTextSettings} className="mt-4 space-y-4">
          <div>
            <label htmlFor="site_name" className="mb-1 block text-sm font-medium text-gray-700">
              Nome do site
            </label>
            <input
              id="site_name"
              name="site_name"
              type="text"
              required
              defaultValue={s.site_name}
              maxLength={60}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="site_tagline" className="mb-1 block text-sm font-medium text-gray-700">
              Slogan (descrição curta)
            </label>
            <input
              id="site_tagline"
              name="site_tagline"
              type="text"
              defaultValue={s.site_tagline}
              maxLength={120}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="banner_heading" className="mb-1 block text-sm font-medium text-gray-700">
              Título do banner (hero)
            </label>
            <input
              id="banner_heading"
              name="banner_heading"
              type="text"
              defaultValue={s.banner_heading}
              maxLength={100}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="banner_subtext" className="mb-1 block text-sm font-medium text-gray-700">
              Subtítulo do banner
            </label>
            <textarea
              id="banner_subtext"
              name="banner_subtext"
              rows={2}
              defaultValue={s.banner_subtext}
              maxLength={200}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Guardar textos
          </button>
        </form>
      </section>

      {/* ── CONTACTOS ───────────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-800">Contactos da plataforma</h2>
        <p className="mt-1 text-xs text-gray-500">
          Informações de contacto do suporte (visíveis nas páginas de rodapé futuras).
        </p>

        <form action={saveTextSettings} className="mt-4 space-y-4">
          <div>
            <label htmlFor="contact_email" className="mb-1 block text-sm font-medium text-gray-700">
              Email de contacto
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={s.contact_email}
              placeholder="suporte@exemplo.co.mz"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact_whatsapp" className="mb-1 block text-sm font-medium text-gray-700">
              WhatsApp de suporte
            </label>
            <input
              id="contact_whatsapp"
              name="contact_whatsapp"
              type="tel"
              defaultValue={s.contact_whatsapp}
              placeholder="84xxxxxxx"
              className={inputClass}
            />
          </div>

          {/* Campos ocultos para não sobrescrever outros campos ao guardar */}
          <input type="hidden" name="site_name" value={s.site_name} />
          <input type="hidden" name="site_tagline" value={s.site_tagline} />
          <input type="hidden" name="banner_heading" value={s.banner_heading} />
          <input type="hidden" name="banner_subtext" value={s.banner_subtext} />

          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Guardar contactos
          </button>
        </form>
      </section>
    </div>
  );
}
