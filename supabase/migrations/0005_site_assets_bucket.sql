-- Módulo: Bucket de assets do site (logo, banner)
-- Bucket público para guardar o logo e o banner da plataforma.
-- Só administradores podem fazer upload/delete; leitura é pública.

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- Leitura pública (logo e banner precisam de ser acessíveis a todos)
drop policy if exists "site-assets são públicos" on storage.objects;
create policy "site-assets são públicos"
  on storage.objects for select
  using (bucket_id = 'site-assets');

-- Upload apenas por administradores
drop policy if exists "Admins podem fazer upload de site-assets" on storage.objects;
create policy "Admins podem fazer upload de site-assets"
  on storage.objects for insert
  with check (
    bucket_id = 'site-assets'
    and public.is_admin()
  );

-- Update apenas por administradores
drop policy if exists "Admins podem atualizar site-assets" on storage.objects;
create policy "Admins podem atualizar site-assets"
  on storage.objects for update
  using (
    bucket_id = 'site-assets'
    and public.is_admin()
  );

-- Delete apenas por administradores
drop policy if exists "Admins podem apagar site-assets" on storage.objects;
create policy "Admins podem apagar site-assets"
  on storage.objects for delete
  using (
    bucket_id = 'site-assets'
    and public.is_admin()
  );
