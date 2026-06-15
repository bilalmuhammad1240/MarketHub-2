-- Módulo 2: Autenticação
-- Tabela "profiles" — equivalente à tabela "users" da especificação
-- (seção 6.1). Usamos "profiles" e não "users" porque o Supabase já
-- tem o schema interno "auth.users" para credenciais; esta tabela
-- guarda os dados públicos do utilizador (nome, telefone, cidade).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  city text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Qualquer pessoa pode ver os dados públicos do perfil.
-- Necessário para mostrar o "Nome do vendedor" na página do anúncio
-- (Módulo 3, seção 5.4 da especificação).
drop policy if exists "Perfis são visíveis publicamente" on public.profiles;
create policy "Perfis são visíveis publicamente"
  on public.profiles for select
  using (true);

-- O utilizador só pode atualizar o seu próprio perfil.
drop policy if exists "Utilizadores podem atualizar o seu próprio perfil" on public.profiles;
create policy "Utilizadores podem atualizar o seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Função + trigger: cria automaticamente uma linha em "profiles"
-- sempre que um novo utilizador se regista via Supabase Auth.
-- Os campos "name", "phone" e "city" vêm dos metadados enviados
-- no momento do registo (ver app/auth/actions.ts -> signup).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'city'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
