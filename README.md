# MozMarketHub — Módulos 1 a 5

Marketplace digital para Moçambique. Esta entrega inclui:

- **Módulo 1 — Base do projeto:** Next.js 15 (App Router) + Tailwind CSS +
  Supabase, pronto para deploy na Vercel.
- **Módulo 2 — Autenticação:** registo, login, logout e perfil de utilizador
  com Supabase Auth.
- **Módulo 3 — Anúncios:** criar, editar, eliminar anúncios, upload de
  imagens (até 5), página pública do anúncio e painel "Os meus anúncios".
- **Módulo 4 — Pesquisa e filtros:** pesquisa por texto, filtro por
  categoria e cidade, ordenação e paginação.
- **Módulo 5 — Administração:** painel admin para aprovar/rejeitar (com
  motivo) e eliminar anúncios, e ver utilizadores e estatísticas.

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
│   ├── meus-anuncios/
│   │   ├── page.tsx                   # Painel do utilizador (seção 5.5)
│   │   └── delete-listing-button.tsx
│   └── admin/
│       ├── layout.tsx                 # Guarda de rota (apenas role=admin)
│       ├── page.tsx                   # Estatísticas (seção 5.6)
│       ├── actions.ts                 # approveListing, rejectListing, adminDeleteListing
│       ├── anuncios/page.tsx          # Moderação: aprovar/rejeitar/eliminar
│       └── utilizadores/page.tsx      # Lista de utilizadores
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
│   ├── admin.ts                       # requireAdmin() — guarda de rota
│   ├── listing-deletion.ts            # Eliminação partilhada (dono + admin)
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
   3. `supabase/migrations/0003_admin.sql`

   A segunda migração cria:
   - as tabelas `listings` e `listing_images` (especificação, seções 6.2/6.3);
   - índices para pesquisa/filtros futuros (categoria, cidade, estado);
   - triggers que garantem que todo anúncio novo começa como `pending`, e
     que edições do dono voltam o anúncio para `pending` (seção 10);
   - políticas RLS (anúncios aprovados são públicos; o dono vê/edita/elimina
     os seus, mesmo pendentes/rejeitados);
   - o bucket público **`listings`** no Storage, com políticas para leitura
     pública e upload/eliminação apenas pelo dono.

   A terceira migração (Módulo 5) adiciona:
   - a coluna `profiles.role` (`user` | `admin`) e `listings.rejection_reason`;
   - a função `is_admin()` e a RPC `admin_set_listing_status(...)`, usada
     para aprovar/rejeitar anúncios sem reiniciar a revisão;
   - políticas RLS extra: administradores veem/editam/eliminam todos os
     anúncios e veem todos os perfis;
   - **correção de privacidade**: a política de `profiles` da migração 0001
     (`using (true)`, que tornava email/telefone de todos os utilizadores
     legíveis publicamente) é substituída por: o próprio utilizador vê o seu
     perfil; administradores veem todos; e qualquer pessoa vê o perfil de um
     vendedor com pelo menos um anúncio aprovado (para "Anunciado por
     &lt;nome&gt;").

5. **Configurar a confirmação de email (opcional, mas recomendado)**

   Em **Authentication > URL Configuration**, defina o `Site URL` para o
   domínio da sua app. Em **Authentication > Email Templates > Confirm
   signup**, garanta que o link aponta para:

   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/
   ```

   > Pode desativar "Confirm email" em **Authentication > Providers > Email**
   > durante os testes — o registo continua a funcionar (entra direto).

6. **Tornar-se administrador**

   Não existe registo de administradores pela interface. Depois de criar a
   sua conta em `/registo`, no **SQL Editor** do Supabase execute:

   ```sql
   update public.profiles set role = 'admin' where email = 'seu@email.com';
   ```

   Volte a entrar (logout/login) e o link **"Admin"** aparece no cabeçalho,
   dando acesso a `/admin`.

7. **Correr em ambiente local**

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000).

   - **Criar conta / Entrar:** `/registo`, `/login`
   - **Publicar anúncio:** `/anuncios/novo` (até 5 fotos, JPG/PNG/WEBP, máx 5MB cada)
   - **Pesquisar:** `/anuncios`
   - **Ver anúncio:** `/anuncios/[id]`
   - **Editar/eliminar:** `/anuncios/[id]/editar`
   - **Painel do utilizador:** `/meus-anuncios`
   - **Painel admin** (após promover a sua conta, passo 6): `/admin`,
     `/admin/anuncios`, `/admin/utilizadores`

   > Os anúncios novos ficam com estado **"Pendente"** e só aparecem na
   > pesquisa/página inicial depois de aprovados em `/admin/anuncios`.

8. **Deploy na Vercel**

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

## Sistema de debug visível (toasts + logs)

Para facilitar a deteção de erros sem precisar de acesso às DevTools:

- **`components/Toast.tsx`** — sistema de notificações na tela (`ToastProvider`,
  hook `useToast()`). Erros ficam visíveis 15 segundos; mensagens de
  sucesso/info, 6 segundos. Está montado no `app/layout.tsx`, por isso
  qualquer Client Component pode usar `useToast()`.
- **`components/TrackedImage.tsx`** — substituto de `next/image` usado em
  todos os locais que mostram fotos do Supabase Storage. Se uma imagem
  falhar a carregar, mostra um aviso no próprio local da imagem + toast +
  `console.error` com o URL exato que falhou.
- **`components/QueryErrorToast.tsx`** — Client Component que lê um erro
  vindo de um redirect do servidor (ex.: `?imageError=...`,
  `?actionError=...`) e mostra-o como toast assim que a página carrega.
  Usado quando uma Server Action falha *depois* de já ter feito redirect
  (ex.: anúncio criado com sucesso, mas as fotos não foram guardadas).
- **`app/global-error.tsx`** — ecrã de erro global do Next.js, substituído
  para mostrar a mensagem e o `digest` do erro diretamente na tela, em vez
  do ecrã genérico "Application error".

**Todas as Server Actions e queries principais** (`createListing`,
`updateListing`, `deleteListing`, `approveListing`, `rejectListing`,
`adminDeleteListing`, `updateProfile`, `login`, `signup`, `logout`, e as
queries de listagem em cada página) têm `console.error`/`console.warn`
detalhados (código, mensagem, `details`, `hint` do Postgres/PostgREST) —
visíveis no terminal em desenvolvimento, e em **Vercel > o seu projeto >
Logs / Runtime Logs** em produção.

> **Nota técnica:** os formulários de criar/editar anúncio (`listing-form.tsx`,
> `listing-edit-form.tsx`) chamam Server Actions que terminam com
> `redirect()`. O Next.js sinaliza isso lançando uma exceção especial
> (`digest` a começar por `NEXT_REDIRECT`); os dois formulários verificam
> isso explicitamente (`isNextRedirectError`) antes de tratar uma exceção
> como erro real, para não bloquear o redirect de sucesso.



- **`/admin`** — estatísticas: total de utilizadores, total de anúncios, e
  contagem por estado (pendente/aprovado/rejeitado).
- **`/admin/anuncios`** — fila de moderação com separadores por estado.
  Cada anúncio tem "Aprovar", "Rejeitar" (com motivo opcional, mostrado ao
  dono) e "Eliminar".
- **`/admin/utilizadores`** — lista de utilizadores com nome, email, cidade,
  data de registo e número de anúncios.
- Acesso restrito por `profiles.role = 'admin'` (RLS + verificação na
  aplicação); utilizadores normais recebem 404 em `/admin/*`.
- Aprovar/rejeitar usa a função SQL `admin_set_listing_status(...)`, que
  altera o estado sem reativar o trigger que devolveria o anúncio a
  "pending".

## Próximo passo

Todos os módulos do plano original (1 a 5) estão implementados. Possíveis
melhorias futuras (fora do MVP, especificação seção 12): pagamentos
M-Pesa/e-Mola, anúncios em destaque, apps móveis, sistema de reputação.


