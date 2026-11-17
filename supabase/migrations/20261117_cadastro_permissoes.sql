-- Atualização para o Supabase já instalado. Execute uma vez no SQL Editor.
begin;
alter table public.perfis add column if not exists endereco text not null default '';
alter table public.perfis add column if not exists cep text not null default '';
alter table public.perfis add column if not exists logradouro text not null default '';
alter table public.perfis add column if not exists bairro text not null default '';
alter table public.perfis add column if not exists numero text not null default '';
alter table public.perfis add column if not exists cidade text not null default '';
alter table public.perfis add column if not exists uf text not null default '';
create or replace function public.criar_perfil() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis(id,nome,endereco,cep,logradouro,bairro,numero,cidade,uf)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nome'),''),split_part(coalesce(new.email,''),'@',1)),
    coalesce(trim(new.raw_user_meta_data->>'endereco'),''),
    coalesce(trim(new.raw_user_meta_data->>'cep'),''),
    coalesce(trim(new.raw_user_meta_data->>'logradouro'),''),
    coalesce(trim(new.raw_user_meta_data->>'bairro'),''),
    coalesce(trim(new.raw_user_meta_data->>'numero'),''),
    coalesce(trim(new.raw_user_meta_data->>'cidade'),''),
    coalesce(trim(new.raw_user_meta_data->>'uf'),'')
  );
  return new;
end $$;
-- Preserva os dados das contas existentes e recupera informações já preenchidas no cadastro.
update public.perfis p set
  endereco = case when p.endereco='' then coalesce(trim(u.raw_user_meta_data->>'endereco'),'') else p.endereco end,
  cep = case when p.cep='' then coalesce(trim(u.raw_user_meta_data->>'cep'),'') else p.cep end,
  logradouro = case when p.logradouro='' then coalesce(trim(u.raw_user_meta_data->>'logradouro'),'') else p.logradouro end,
  bairro = case when p.bairro='' then coalesce(trim(u.raw_user_meta_data->>'bairro'),'') else p.bairro end,
  numero = case when p.numero='' then coalesce(trim(u.raw_user_meta_data->>'numero'),'') else p.numero end,
  cidade = case when p.cidade='' then coalesce(trim(u.raw_user_meta_data->>'cidade'),'') else p.cidade end,
  uf = case when p.uf='' then coalesce(trim(u.raw_user_meta_data->>'uf'),'') else p.uf end
from auth.users u where u.id=p.id;
create or replace function privado.e_agricultor() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfis where id=(select auth.uid()) and papel='agricultor')
$$;
revoke all on function privado.e_agricultor() from public;
grant execute on function privado.e_agricultor() to authenticated;
drop policy if exists requerimentos_criar on public.requerimentos;
create policy requerimentos_criar on public.requerimentos for insert to authenticated
with check(autor_id=(select auth.uid()) and situacao='Recebido' and privado.e_agricultor());
commit;
