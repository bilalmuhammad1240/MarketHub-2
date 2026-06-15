# MozMarketHub — Módulo 1 + Módulo 2 + Módulo 3 + Módulo 4

Marketplace digital para Moçambique. Esta entrega inclui:

- **Módulo 1 — Base do projeto:** Next.js 15 (App Router) + Tailwind CSS +
  Supabase, pronto para deploy na Vercel.
- **Módulo 2 — Autenticação:** registo, login, logout e perfil de utilizador
  com Supabase Auth.
- **Módulo 3 — Anúncios:** criar, editar, eliminar anúncios, upload de
  imagens (até 5), página pública do anúncio e painel "Os meus anúncios".
- **Módulo 4 — Pesquisa e filtros:** pesquisa por texto, filtro por
  categoria e cidade, ordenação e paginação.

## Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Estilos:** Tailwind CSS, com as cores oficiais do MozMarketHub
- **Backend:** Supabase (Auth + Postgres + Storage)
- **Hosting:** Vercel

## Estrutura de pastas

```
mozmarkethub/
├── app/
│   ├── layout.tsx                    # Layout raiz (Header + fontes)
│   ├── page.tsx                       # Home: hero, categorias, últimos anúncios
│   ├── globals.css
│   ├── login/page.tsx                 # Login (suporta ?next=)
│   ├── registo/
│   │   ├── page.tsx                   # Registo
│   │   └── confirmar/page.tsx         # "Confirme o seu email"
│   ├── perfil/
│   │   ├── page.tsx                   # Perfil (protegido)
│   │   ├── profile-form.tsx           # Ver/editar perfil + link "Os meus anúncios"
│   │   └── actions.ts                 # Server action: updateProfile
│   ├── auth/
│   │   ├── actions.ts                 # Server actions: login, signup, logout
│   │   ├── confirm/route.ts           # Callback de confirmação de email
│   │   └── error/page.tsx
│   ├── anuncios/
│   │   ├── page.tsx                   # Pesquisa/listagem (texto, categoria, cidade, ordenação)
│   │   ├── novo/
│   │   │   ├── page.tsx               # Publicar anúncio (protegido)
│   │   │   ├── listing-form.tsx       # Formulário + upload de imagens
│   │   │   └── actions.ts             # Server action: createListing
│   │   └── [id]/
│   │       ├── page.tsx               # Página pública do anúncio
│   │       └── editar/
│   │           ├── page.tsx           # Editar (dono)
│   │           ├── listing-edit-form.tsx
│   │           └── actions.ts         # Server actions: updateListing, deleteListing
│   └── meus-anuncios/
│       ├── page.tsx                   # Painel do utilizador (seção 5.5)
│       └── delete-listing-button.tsx
├── components/
│   ├── Header.tsx                     # Navbar (estado de autenticação)
│   ├── LogoutButton.tsx
│   ├── ListingFields.tsx              # Campos partilhados do formulário de anúncio
│   ├── ImageUploadField.tsx           # Seleção/preview de até 5 fotos
│   ├── ImageCarousel.tsx              # Carrossel na página do anúncio
│   ├── ListingCard.tsx                # Card de anúncio (grids)
│   ├── SearchFilters.tsx              # Formulário de pesquisa/filtros (Módulo 4)
│   └── StatusBadge.tsx                # Pendente / Aprovado / Rejeitado
├── lib/
│   ├── constants.ts                   # Cidades de Moçambique + categorias
│   ├── types.ts                       # Profile, Listing, ListingImage...
│   ├── utils.ts                       # formatPrice, whatsappLink, etc.
│   └── supabase/
│       ├── client.ts                  # Cliente Supabase para o browser
│       ├── server.ts                  # Cliente Supabase para Server Components
│       └── middleware.ts              # Refresh de sessão
├── supabase/
│   └── migrations/
│       ├── 0001_create_profiles.sql   # Tabela profiles + RLS + trigger
│       └── 0002_create_listings.sql   # listings, listing_images, RLS, storage
├── middleware.ts
├── tailwind.config.ts
├── .env.local.example
└── package.json
```

## Como começar

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Criar projeto no Supabase**

   - Vá a [supabase.com](https://supabase.com) e crie um novo projeto.
   - Em *Project Settings > API*, copie o `Project URL` e a `anon public key`.

3. **Configurar variáveis de ambiente**

   ```bash
   cp .env.local.example .env.local
   ```

   Edite `.env.local` e preencha:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Executar as migrações SQL (por ordem)**

   No painel do Supabase, abra **SQL Editor**, e execute, por esta ordem:

   1. `supabase/migrations/0001_create_profiles.sql`
   2. `supabase/migrations/0002_create_listings.sql`

   A segunda migração cria:
   - as tabelas `listings` e `listing_images` (especificação, seções 6.2/6.3);
   - índices para pesquisa/filtros futuros (categoria, cidade, estado);
   - triggers que garantem que todo anúncio novo começa como `pending`, e
     que edições do dono voltam o anúncio para `pending` (seção 10);
   - políticas RLS (anúncios aprovados são públicos; o dono vê/edita/elimina
     os seus, mesmo pendentes/rejeitados);
   - o bucket público **`listings`** no Storage, com políticas para leitura
     pública e upload/eliminação apenas pelo dono.

5. **Configurar a confirmação de email (opcional, mas recomendado)**

   Em **Authentication > URL Configuration**, defina o `Site URL` para o
   domínio da sua app. Em **Authentication > Email Templates > Confirm
   signup**, garanta que o link aponta para:

   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/
   ```

   > Pode desativar "Confirm email" em **Authentication > Providers > Email**
   > durante os testes — o registo continua a funcionar (entra direto).

6. **Correr em ambiente local**

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000).

   - **Criar conta / Entrar:** `/registo`, `/login`
   - **Publicar anúncio:** `/anuncios/novo` (até 5 fotos, JPG/PNG/WEBP, máx 5MB cada)
   - **Ver anúncio:** `/anuncios/[id]`
   - **Editar/eliminar:** `/anuncios/[id]/editar`
   - **Painel do utilizador:** `/meus-anuncios`

   > Os anúncios novos ficam com estado **"Pendente"** e só aparecem na
   > página inicial depois de aprovados. Para testar o fluxo completo antes
   > do Módulo 5 (Admin), pode aprovar manualmente no Supabase: tabela
   > `listings` > editar a linha > `status = approved`.

7. **Deploy na Vercel**

   - Faça push deste código para o GitHub.
   - Importe o repositório na [Vercel](https://vercel.com).
   - Adicione as mesmas variáveis de ambiente no painel da Vercel.
   - Atualize o `Site URL` no Supabase para o domínio de produção.

### Nota sobre upload de imagens

As fotos são enviadas **diretamente do browser para o Supabase Storage**
(usando a sessão do utilizador), e só os URLs públicos resultantes são
enviados ao servidor. Isto evita os limites de tamanho de payload de
funções serverless (ex.: ~4.5MB na Vercel) mesmo com várias fotos grandes.

## Design system

| Token        | Valor     |
| ------------ | --------- |
| `primary`    | `#16A34A` |
| `primary-dark` | `#14532D` |
| `background` | `#F3F4F6` |
| `white`      | `#FFFFFF` |

## Pesquisa e filtros (Módulo 4)

- **Página:** `/anuncios` — pesquisa por texto (título/descrição), filtro por
  categoria, filtro por cidade, ordenação (mais recentes, preço menor/maior)
  e paginação (12 anúncios por página).
- A barra de pesquisa na página inicial e os cartões de categoria levam
  diretamente para `/anuncios` com os filtros já aplicados.
- O ícone de pesquisa no cabeçalho dá acesso a `/anuncios` em qualquer página.
- Tudo funciona com formulários `GET` simples — sem JavaScript obrigatório,
  bom para ligações lentas (princípio "internet fraca").

## Próximo passo

Módulo 5 — Administração: painel admin para aprovar/rejeitar anúncios, ver
utilizadores e estatísticas básicas (especificação, seção 5.6).


