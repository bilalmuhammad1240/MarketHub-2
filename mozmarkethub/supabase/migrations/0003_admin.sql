-- Módulo 5: Administração (especificação, seções 4.3, 5.6 e 10)

-- =========================================================================
-- 1. Papel do utilizador
-- =========================================================================

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

-- =========================================================================
-- 2. Motivo de rejeição ("Admin pode rejeitar com motivo", seção 10)
-- =========================================================================

alter table public.listings
  add column if not exists rejection_reason text;

-- =========================================================================
-- 3. Função auxiliar is_admin()
-- "security definer" faz com que esta função corra com os privilégios do
-- seu dono (que não está sujeito ao RLS de "profiles"), evitando recursão
-- infinita quando usada dentro de políticas RLS da própria tabela "profiles".
-- =========================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================================
-- 4. RLS adicional: administradores veem/gerem tudo
-- (políticas permissivas adicionais; combinam com "OR" às já existentes)
-- =========================================================================

drop policy if exists "Admins veem todos os anúncios" on public.listings;
create policy "Admins veem todos os anúncios"
  on public.listings for select
  using (public.is_admin());

drop policy if exists "Admins podem atualizar qualquer anúncio" on public.listings;
create policy "Admins podem atualizar qualquer anúncio"
  on public.listings for update
  using (public.is_admin());

drop policy if exists "Admins podem eliminar qualquer anúncio" on public.listings;
create policy "Admins podem eliminar qualquer anúncio"
  on public.listings for delete
  using (public.is_admin());

drop policy if exists "Admins veem todos os perfis" on public.profiles;
create policy "Admins veem todos os perfis"
  on public.profiles for select
  using (public.is_admin());

-- =========================================================================
-- 5. Aprovar / rejeitar anúncios sem reiniciar a revisão
--
-- O trigger "protect_listing_status" (migração 0002) volta o status para
-- "pending" em qualquer UPDATE feito por um utilizador normal. Esta
-- função define app.allow_status_change='true' apenas para a transação
-- atual, permitindo que o admin altere o status diretamente.
-- =========================================================================

create or replace function public.admin_set_listing_status(
  p_listing_id uuid,
  p_status text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_status not in ('pending', 'approved', 'rejected') then
    raise exception 'invalid status: %', p_status;
  end if;

  perform set_config('app.allow_status_change', 'true', true);

  update public.listings
  set
    status = p_status,
    rejection_reason = case when p_status = 'rejected' then p_reason else null end
  where id = p_listing_id;
end;
$$;

grant execute on function public.admin_set_listing_status(uuid, text, text) to authenticated;

-- =========================================================================
-- 6. Correção de privacidade (Módulo 2)
--
-- A migração 0001 criou a política "Perfis são visíveis publicamente"
-- (using (true)), que tornava email/telefone de TODOS os utilizadores
-- legíveis por qualquer pessoa via API. Substituímos por políticas mais
-- restritas:
--   - o próprio utilizador vê sempre o seu perfil completo;
--   - administradores veem todos os perfis (política 4, acima);
--   - qualquer pessoa vê o perfil de um vendedor com pelo menos um
--     anúncio aprovado (necessário para "Anunciado por <nome>", seção 5.4;
--     o WhatsApp desse vendedor já é público no próprio anúncio).
-- =========================================================================

drop policy if exists "Perfis são visíveis publicamente" on public.profiles;

drop policy if exists "Utilizadores veem o seu próprio perfil" on public.profiles;
create policy "Utilizadores veem o seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Perfis de vendedores com anúncios aprovados são visíveis" on public.profiles;
create policy "Perfis de vendedores com anúncios aprovados são visíveis"
  on public.profiles for select
  using (
    exists (
      select 1 from public.listings
      where listings.user_id = profiles.id
        and listings.status = 'approved'
    )
  );

-- =========================================================================
-- 7. Tornar um utilizador administrador (executar manualmente)
--
-- Não existe fluxo de registo para administradores: o primeiro admin deve
-- ser promovido manualmente depois de criar uma conta normal em /registo.
--
--   update public.profiles set role = 'admin' where email = 'seu@email.com';
-- =========================================================================
