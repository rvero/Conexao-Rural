# Configuração do Supabase para Conexão Rural

Esta versão depende de tabelas e políticas no Supabase. Não publique o código atualizado antes de configurar e testar o projeto. Os dados antigos da demonstração no navegador não são migrados.

1. No painel do Supabase, em Authentication > Sign In / Providers > Email, desative a confirmação de e-mail (Confirm email). Assim, novos usuários podem entrar sem receber mensagens. Para um projeto de faculdade use dados fictícios; com a confirmação desativada, o sistema não comprova que o usuário controla o endereço.
2. No SQL Editor, abra uma nova consulta e execute o conteúdo inteiro de `supabase/schema.sql` em um projeto novo. O script cria perfis, setores, requerimentos, mensagens, anexos, regras RLS e dois buckets privados. Ele faz uma única transação e não é um script para reaplicar em uma base já configurada.
3. Execute também `supabase/migrations/20261117_cadastro_permissoes.sql` no SQL Editor. Essa atualização adiciona endereço aos perfis e restringe a criação de requerimentos a agricultores. Não execute o schema inicial novamente em um projeto já configurado.
4. Crie uma conta pessoal no site e, em Authentication > Users, localize o UUID da conta. No SQL Editor, execute o comando abaixo substituindo apenas o UUID pelo da conta escolhida:

```sql
update public.perfis
set papel = 'administrador'
where id = 'COLE-AQUI-O-UUID-DA-CONTA'::uuid
returning id, nome, papel;
```

O resultado deve mostrar uma linha e `administrador`. O login e a senha são os escolhidos no cadastro da própria conta. Essa operação deve ser feita apenas no painel do proprietário, não no código do site. Evite compartilhar a senha ou chaves secretas.
5. Publique a Edge Function `criar-atendente` com o Supabase CLI autenticado no projeto: `supabase functions deploy criar-atendente --project-ref SEU_PROJECT_REF`. A função valida a sessão e o papel do administrador no servidor antes de criar o atendente. A senha inicial é definida no formulário de administração. O login `nome@rural.com` é um identificador; sem uma caixa de e-mail real ou SMTP, recuperação por e-mail não funciona.
6. Teste com contas distintas de agricultor, atendente de um setor e administrador, em navegadores separados. Verifique que o agricultor só vê seus requerimentos e que o atendente só acessa os setores atribuídos. Teste a troca de setor, mensagens, anexos e foto. Teste também acessos indevidos por chamadas diretas à API, não apenas pela interface.

A gravação é feita no navegador e fica anexada. A transcrição depende da API de reconhecimento de voz e não está disponível em todos os navegadores. O login por telefone não foi integrado: exige configuração e contratação de provedor de SMS. A função de atendentes e as políticas não foram executadas ou verificadas em um projeto Supabase real neste ambiente.
