-- Permite registrar uma solicitação como recusada, preservando os dados atuais.
begin;
alter table public.requerimentos drop constraint if exists requerimentos_situacao_check;
alter table public.requerimentos add constraint requerimentos_situacao_check
check (situacao in ('Recebido','Em andamento','Concluído','Recusado'));
commit;
