# Ativação de edição e exclusão de contas

Esta atualização pressupõe que `20261117_cadastro_permissoes.sql` já tenha sido executado. Ela não exclui nenhuma conta ao ser aplicada.

1. No Supabase, abra SQL Editor > New query e execute todo o conteúdo de `supabase/migrations/20261117_editar_excluir_conta.sql`. Ele autoriza a alteração dos campos próprios do perfil e adapta as referências para preservar os requerimentos após a exclusão. Confirme que retornou Success.
2. Em Edge Functions, escolha Deploy a new function > Via Editor. Crie a função com o nome `alterar-email`, substitua o conteúdo do arquivo `index.ts` pelo arquivo `supabase/functions/alterar-email/index.ts` deste projeto e clique em Deploy function.
3. Repita para a função `excluir-agricultor`, usando o conteúdo de `supabase/functions/excluir-agricultor/index.ts`. Mantenha a verificação de JWT habilitada. As funções obtêm as chaves privilegiadas no ambiente do próprio Supabase; não insira essas chaves no código nem no navegador.
4. Após as funções e o SQL estarem ativos, publique a atualização do site. Teste com contas fictícias, incluindo uma conta agricultora, um atendente e uma conta administradora. Confirme que um agricultor não pode apagar outra conta nem uma conta de administrador, que a senha incorreta impede a autoexclusão, e que os pedidos e anexos permanecem acessíveis à equipe após a exclusão.

A alteração de e-mail verifica a senha atual e não envia e-mail de confirmação, conforme a escolha feita para este projeto. Isso não comprova que a pessoa controla o novo endereço. A exclusão remove a conta e o vínculo dos pedidos, mensagens e anexos com o perfil, mas o conteúdo escrito e os arquivos podem conter dados pessoais. A remoção pode precisar ser repetida se ocorrer uma falha durante a reorganização de arquivos. A função retorna um erro nesses casos.

As funções e o SQL não foram executados neste ambiente contra o banco real. Testes locais usam serviços simulados; verifique o funcionamento em contas de teste antes de usar dados reais.
