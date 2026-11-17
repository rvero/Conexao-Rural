-- Conexão Rural: execute uma vez no SQL Editor de um projeto Supabase novo.
begin;
create extension if not exists pgcrypto;
create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  papel text not null default 'agricultor' check (papel in ('agricultor','atendente','administrador')),
  foto_caminho text,
  criado_em timestamptz not null default now()
);
create table public.setores_atendente (
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  setor text not null check (setor in ('Água','Energia','Estradas','Assistência técnica','Outros')),
  primary key (usuario_id,setor)
);
create table public.requerimentos (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.perfis(id),
  titulo text not null check (length(trim(titulo)) between 1 and 200),
  corpo text not null check (length(trim(corpo)) between 1 and 20000),
  setor text not null check (setor in ('Água','Energia','Estradas','Assistência técnica','Outros')),
  comunidade text not null check (length(trim(comunidade)) between 1 and 200),
  tipo text not null default 'Individual' check (tipo in ('Individual','Coletiva')),
  situacao text not null default 'Recebido' check (situacao in ('Recebido','Em andamento','Concluído')),
  criado_em timestamptz not null default now()
);
create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  requerimento_id uuid not null references public.requerimentos(id) on delete cascade,
  autor_id uuid not null references public.perfis(id),
  corpo text not null check (length(trim(corpo)) between 1 and 20000),
  criado_em timestamptz not null default now()
);
create table public.anexos (
  id uuid primary key default gen_random_uuid(),
  requerimento_id uuid not null references public.requerimentos(id) on delete cascade,
  autor_id uuid not null references public.perfis(id),
  nome text not null,
  caminho text not null unique,
  criado_em timestamptz not null default now()
);
create function public.criar_perfil() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.perfis(id,nome) values (new.id,coalesce(new.raw_user_meta_data->>'nome',split_part(coalesce(new.email,''),'@',1))); return new; end $$;
create trigger ao_criar_usuario after insert on auth.users for each row execute function public.criar_perfil();
insert into public.perfis(id,nome) select id,split_part(coalesce(email,''),'@',1) from auth.users on conflict (id) do nothing;
create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to authenticated;
create function privado.e_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.perfis where id = (select auth.uid()) and papel = 'administrador') $$;
create function privado.pode_ver_requerimento(rid uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.requerimentos r where r.id=rid and (r.autor_id=(select auth.uid()) or privado.e_admin() or exists(select 1 from public.setores_atendente s join public.perfis p on p.id=s.usuario_id where p.id=(select auth.uid()) and p.papel='atendente' and s.setor=r.setor)))
$$;
create function privado.pode_atender(rid uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.requerimentos r where r.id=rid and (privado.e_admin() or exists(select 1 from public.setores_atendente s join public.perfis p on p.id=s.usuario_id where p.id=(select auth.uid()) and p.papel='atendente' and s.setor=r.setor)))
$$;
revoke all on all functions in schema privado from public;
grant execute on function privado.e_admin(), privado.pode_ver_requerimento(uuid), privado.pode_atender(uuid) to authenticated;
alter table public.perfis enable row level security;
alter table public.setores_atendente enable row level security;
alter table public.requerimentos enable row level security;
alter table public.mensagens enable row level security;
alter table public.anexos enable row level security;
revoke all on public.perfis,public.setores_atendente,public.requerimentos,public.mensagens,public.anexos from anon,authenticated;
grant select on public.perfis,public.setores_atendente,public.requerimentos,public.mensagens,public.anexos to authenticated;
grant insert on public.requerimentos,public.mensagens,public.anexos to authenticated;
grant update(setor,situacao) on public.requerimentos to authenticated;
grant update(nome,foto_caminho) on public.perfis to authenticated;
grant insert,update,delete on public.setores_atendente to authenticated;
create policy perfis_leitura on public.perfis for select to authenticated using (id=(select auth.uid()) or privado.e_admin() or exists(select 1 from public.mensagens m where m.autor_id=perfis.id and privado.pode_ver_requerimento(m.requerimento_id)) or exists(select 1 from public.requerimentos r where r.autor_id=perfis.id and privado.pode_ver_requerimento(r.id)));
create policy perfis_editar_proprio on public.perfis for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy setores_leitura on public.setores_atendente for select to authenticated using(usuario_id=(select auth.uid()) or privado.e_admin());
create policy setores_admin on public.setores_atendente for all to authenticated using(privado.e_admin()) with check(privado.e_admin());
create policy requerimentos_leitura on public.requerimentos for select to authenticated using(privado.pode_ver_requerimento(id));
create policy requerimentos_criar on public.requerimentos for insert to authenticated with check(autor_id=(select auth.uid()) and situacao='Recebido');
create policy requerimentos_atender on public.requerimentos for update to authenticated using(privado.pode_atender(id)) with check(true);
create policy mensagens_leitura on public.mensagens for select to authenticated using(privado.pode_ver_requerimento(requerimento_id));
create policy mensagens_criar on public.mensagens for insert to authenticated with check(autor_id=(select auth.uid()) and privado.pode_ver_requerimento(requerimento_id));
create policy anexos_leitura on public.anexos for select to authenticated using(privado.pode_ver_requerimento(requerimento_id));
create policy anexos_criar on public.anexos for insert to authenticated with check(autor_id=(select auth.uid()) and privado.pode_ver_requerimento(requerimento_id) and split_part(caminho,'/',1)=requerimento_id::text and split_part(caminho,'/',2)=autor_id::text);
insert into storage.buckets(id,name,public,file_size_limit) values ('requerimentos','requerimentos',false,10485760),('perfis','perfis',false,5242880) on conflict(id) do nothing;
create policy arquivos_inserir on storage.objects for insert to authenticated with check (bucket_id='requerimentos' and split_part(name,'/',2)=(select auth.uid())::text and split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' and privado.pode_ver_requerimento(split_part(name,'/',1)::uuid));
create policy arquivos_ler on storage.objects for select to authenticated using (bucket_id='requerimentos' and split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' and privado.pode_ver_requerimento(split_part(name,'/',1)::uuid));
create policy fotos_gravar on storage.objects for insert to authenticated with check(bucket_id='perfis' and split_part(name,'/',1)=(select auth.uid())::text);
create policy fotos_ler on storage.objects for select to authenticated using(bucket_id='perfis' and exists(select 1 from public.perfis p where p.id::text=split_part(name,'/',1)));
commit;
