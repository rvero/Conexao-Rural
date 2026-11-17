-- Execute após 20261117_cadastro_permissoes.sql. Não exclui contas nem registros.
begin;
-- Permite alterar somente os campos próprios do perfil através das políticas já existentes.
grant update (nome, endereco, cep, logradouro, bairro, numero, cidade, uf, foto_caminho) on public.perfis to authenticated;
-- Mantém o histórico caso o perfil seja removido. Conteúdos e anexos permanecem intactos.
alter table public.requerimentos alter column autor_id drop not null;
alter table public.mensagens alter column autor_id drop not null;
alter table public.anexos alter column autor_id drop not null;
alter table public.requerimentos drop constraint if exists requerimentos_autor_id_fkey;
alter table public.requerimentos add constraint requerimentos_autor_id_fkey foreign key (autor_id) references public.perfis(id) on delete set null;
alter table public.mensagens drop constraint if exists mensagens_autor_id_fkey;
alter table public.mensagens add constraint mensagens_autor_id_fkey foreign key (autor_id) references public.perfis(id) on delete set null;
alter table public.anexos drop constraint if exists anexos_autor_id_fkey;
alter table public.anexos add constraint anexos_autor_id_fkey foreign key (autor_id) references public.perfis(id) on delete set null;
-- Somente a função protegida no servidor pode consultar objetos pertencentes a uma conta.
create or replace function public.objetos_da_conta(alvo uuid)
returns table (bucket text,caminho text) language sql security definer set search_path = '' as $$
 select o.bucket_id,o.name from storage.objects o where o.owner_id=alvo::text or o.owner=alvo order by o.bucket_id,o.name limit 1000
$$;
revoke all on function public.objetos_da_conta(uuid) from public,anon,authenticated;
grant execute on function public.objetos_da_conta(uuid) to service_role;
commit;
