-- Execute no SQL Editor uma vez, na base já instalada do Conexão Rural.
begin;
alter table public.perfis add column if not exists endereco text not null default '';
create or replace function public.criar_perfil() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis(id,nome,endereco)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'nome'),''),split_part(coalesce(new.email,''),'@',1)), coalesce(trim(new.raw_user_meta_data->>'endereco'),''));
  return new;
end $$;
-- Preenche o endereço de contas que já se cadastraram com esse dado.
update public.perfis p set endereco = trim(u.raw_user_meta_data->>'endereco')
from auth.users u where u.id=p.id and p.endereco='' and nullif(trim(u.raw_user_meta_data->>'endereco'),'') is not null;
create or replace function privado.e_agricultor() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id=(select auth.uid()) and papel='agricultor')
$$;
revoke all on function privado.e_agricultor() from public;
grant execute on function privado.e_agricultor() to authenticated;
drop policy if exists requerimentos_criar on public.requerimentos;
create policy requerimentos_criar on public.requerimentos for insert to authenticated
with check(autor_id=(select auth.uid()) and situacao='Recebido' and privado.e_agricultor());
commit;
