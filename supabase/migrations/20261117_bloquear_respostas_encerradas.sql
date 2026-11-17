-- Bloqueia novas mensagens em requerimentos encerrados, inclusive chamadas diretas à API.
begin;
create or replace function privado.impedir_resposta_encerrada() returns trigger
language plpgsql security definer set search_path = '' as $$
declare estado text;
begin
 select situacao into estado from public.requerimentos where id = new.requerimento_id for share;
 if estado in ('Concluído', 'Recusado') then
  raise exception 'Este requerimento foi encerrado e não aceita novas mensagens.' using errcode = '23514';
 end if;
 return new;
end $$;
revoke all on function privado.impedir_resposta_encerrada() from public;
drop trigger if exists impedir_resposta_encerrada on public.mensagens;
create trigger impedir_resposta_encerrada before insert on public.mensagens
for each row execute function privado.impedir_resposta_encerrada();
commit;
