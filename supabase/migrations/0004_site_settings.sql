-- Módulo: Configurações do site
-- Tabela de chave-valor para guardar configurações globais da plataforma.
-- Editável apenas por administradores; lida publicamente (nome do site,
-- logo, banner, etc. são necessários em páginas públicas).

create table if not exists public.site_settings (
  key   text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Leitura pública (necessária para mostrar logo/nome do site a visitantes).
drop policy if exists "Configurações são visíveis publicamente" on public.site_settings;
create policy "Configurações são visíveis publicamente"
  on public.site_settings for select
  using (true);

-- Escrita apenas por administradores.
drop policy if exists "Apenas admins podem alterar configurações" on public.site_settings;
create policy "Apenas admins podem alterar configurações"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Valores padrão iniciais.
insert into public.site_settings (key, value) values
  ('site_name',        'MozMarketHub'),
  ('site_tagline',     'Compre, venda e anuncie em Moçambique'),
  ('logo_url',         ''),
  ('banner_url',       ''),
  ('banner_heading',   'Compre, venda e anuncie em Moçambique'),
  ('banner_subtext',   'Produtos, serviços, veículos, casas e empregos — tudo num só lugar.'),
  ('contact_email',    ''),
  ('contact_whatsapp', '')
on conflict (key) do nothing;
