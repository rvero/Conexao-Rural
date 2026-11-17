# Conexão Rural

Aplicação React para registrar e acompanhar requerimentos das comunidades rurais. O Supabase fornece autenticação, dados e armazenamento de arquivos.

## Desenvolvimento

Instale as dependências com `npm install`, crie um arquivo `.env.local` e execute `npm run dev`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
```

O arquivo de ambiente não deve conter chaves secretas. A chave pública é disponibilizada ao navegador; as regras de acesso do Supabase devem proteger os dados.

## Configuração do Supabase

As instruções para criar as tabelas, as regras de acesso, o armazenamento e o primeiro administrador estão em [supabase/INSTRUCOES.md](supabase/INSTRUCOES.md). O script é para instalação inicial e não deve ser executado novamente sobre uma instalação existente. A criação de atendentes usa a Edge Function `criar-atendente`.

A gravação de áudio depende da permissão do navegador, e a transcrição usa a API de reconhecimento de voz quando disponível. O login por telefone requer provedor de SMS e ainda não está implementado.

## Publicação

O GitHub Actions compila e publica no GitHub Pages ao receber alterações na branch `main`. Em Settings > Pages, selecione GitHub Actions como fonte. A aplicação está configurada para o caminho `/Conexao-Rural/`. Configure no Supabase Authentication a URL do site e os redirecionamentos.
