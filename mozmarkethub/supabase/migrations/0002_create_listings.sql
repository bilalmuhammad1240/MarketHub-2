-- Módulo 3: Anúncios
-- Tabelas "listings" e "listing_images" (especificação, seções 6.2 e 6.3),
-- com proteção de estado (seção 10) e bucket de imagens no Storage.

-- "listings.user_id" referencia "profiles" (e não "auth.users" diretamente)
-- para permitir o "embedding" automático profiles<->listings via PostgREST
-- (necessário para mostrar o "Nome do vendedor" na página do anúncio).
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  price numeric not null check (price >= 0),
  category text not null,
  city text not null,
  whatsapp text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists listings_status_created_at_idx on public.listings (status, created_at desc);
create index if not exists listings_user_id_idx on public.listings (user_id);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_city_idx on public.listings (city);
create index if not exists listing_images_listing_id_idx on public.listing_images (listing_id);

-- =========================================================================
-- TRIGGERS: proteção do estado do anúncio (seção 10)
-- =========================================================================

-- Todo anúncio novo começa como "pending", independentemente do que
-- for enviado pelo cliente.
create or replace function public.set_listing_pending_on_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.status := 'pending';
  return new;
end;
$$;

drop trigger if exists listings_set_pending_on_insert on public.listings;
create trigger listings_set_pending_on_insert
  before insert on public.listings
  for each row execute procedure public.set_listing_pending_on_insert();

-- Edições normais (do dono) voltam o anúncio para "pending" para nova
-- revisão. Apenas funções de administração (Módulo 5), que definem
-- app.allow_status_change = 'true' antes do UPDATE, podem alterar o
-- status diretamente (aprovar/rejeitar) sem reiniciar a revisão.
create or replace function public.protect_listing_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if coalesce(current_setting('app.allow_status_change', true), 'false') <> 'true' then
    if new.title is distinct from old.title
       or new.description is distinct from old.description
       or new.price is distinct from old.price
       or new.category is distinct from old.category
       or new.city is distinct from old.city
       or new.whatsapp is distinct from old.whatsapp then
      new.status := 'pending';
    else
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_protect_status on public.listings;
create trigger listings_protect_status
  before update on public.listings
  for each row execute procedure public.protect_listing_status();

-- =========================================================================
-- RLS: listings
-- =========================================================================

alter table public.listings enable row level security;

drop policy if exists "Anúncios aprovados são públicos, dono vê os seus" on public.listings;
create policy "Anúncios aprovados são públicos, dono vê os seus"
  on public.listings for select
  using (status = 'approved' or auth.uid() = user_id);

drop policy if exists "Utilizadores autenticados podem criar anúncios" on public.listings;
create policy "Utilizadores autenticados podem criar anúncios"
  on public.listings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Donos podem editar os seus anúncios" on public.listings;
create policy "Donos podem editar os seus anúncios"
  on public.listings for update
  using (auth.uid() = user_id);

drop policy if exists "Donos podem eliminar os seus anúncios" on public.listings;
create policy "Donos podem eliminar os seus anúncios"
  on public.listings for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- RLS: listing_images
-- =========================================================================

alter table public.listing_images enable row level security;

drop policy if exists "Imagens de anúncios são visíveis" on public.listing_images;
create policy "Imagens de anúncios são visíveis"
  on public.listing_images for select
  using (true);

drop policy if exists "Donos podem adicionar imagens aos seus anúncios" on public.listing_images;
create policy "Donos podem adicionar imagens aos seus anúncios"
  on public.listing_images for insert
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.user_id = auth.uid()
    )
  );

drop policy if exists "Donos podem remover imagens dos seus anúncios" on public.listing_images;
create policy "Donos podem remover imagens dos seus anúncios"
  on public.listing_images for delete
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.user_id = auth.uid()
    )
  );

-- =========================================================================
-- STORAGE: bucket público "listings" para as fotos dos anúncios
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

drop policy if exists "Imagens de anúncios são públicas (storage)" on storage.objects;
create policy "Imagens de anúncios são públicas (storage)"
  on storage.objects for select
  using (bucket_id = 'listings');

drop policy if exists "Utilizadores autenticados podem enviar imagens" on storage.objects;
create policy "Utilizadores autenticados podem enviar imagens"
  on storage.objects for insert
  with check (bucket_id = 'listings' and auth.uid() is not null);

drop policy if exists "Donos podem apagar as suas imagens" on storage.objects;
create policy "Donos podem apagar as suas imagens"
  on storage.objects for delete
  using (bucket_id = 'listings' and owner = auth.uid());
