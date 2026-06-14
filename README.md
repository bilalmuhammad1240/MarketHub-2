# MozMarketHub — Módulo 1: Base do Projeto

Marketplace digital para Moçambique. Esta é a base do projeto: Next.js 15 (App
Router) + Tailwind CSS + Supabase, pronta para os módulos seguintes
(Autenticação, Anúncios, Pesquisa, Administração).

## Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Estilos:** Tailwind CSS, com as cores oficiais do MozMarketHub
- **Backend:** Supabase (Auth + Postgres + Storage)
- **Hosting:** Vercel

## Estrutura de pastas

```
mozmarkethub/
├── app/
│   ├── layout.tsx       # Layout raiz (fontes, metadata)
│   ├── page.tsx         # Página inicial (placeholder do Módulo 1)
│   └── globals.css       # Tailwind + variáveis de cor
├── lib/
│   └── supabase/
│       ├── client.ts     # Cliente Supabase para o browser
│       ├── server.ts     # Cliente Supabase para Server Components
│       └── middleware.ts # Refresh de sessão
├── middleware.ts          # Middleware global (sessão Supabase)
├── tailwind.config.ts     # Cores e tipografia do design system
├── .env.local.example      # Modelo de variáveis de ambiente
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

4. **Correr em ambiente local**

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000). A página inicial
   confirma se as variáveis do Supabase estão configuradas corretamente.

5. **Deploy na Vercel**

   - Crie um repositório no GitHub e faça push deste código.
   - Importe o repositório na [Vercel](https://vercel.com).
   - Adicione as mesmas variáveis de ambiente no painel da Vercel
     (Settings > Environment Variables).

## Design system

| Token        | Valor     |
| ------------ | --------- |
| `primary`    | `#16A34A` |
| `primary-dark` | `#14532D` |
| `background` | `#F3F4F6` |
| `white`      | `#FFFFFF` |

## Próximo passo

Módulo 2 — Autenticação: registo, login, logout e perfil de utilizador com
Supabase Auth.
