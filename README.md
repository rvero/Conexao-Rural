# Conexão Rural

O Conexão Rural é um projeto acadêmico para facilitar o contato entre agricultores e a equipe responsável pelo atendimento às comunidades rurais de Santa Cruz do Capibaribe, Pernambuco.

**Acesse o site:** [rvero.github.io/Conexao-Rural](https://rvero.github.io/Conexao-Rural/)

## Como funciona

- **Agricultor:** cria uma conta, envia requerimentos, acompanha o andamento e troca mensagens enquanto o pedido estiver aberto. Pode anexar fotos, documentos e gravações, além de editar ou excluir a própria conta.
- **Atendente:** acompanha os setores autorizados, responde aos pedidos, encaminha para outro assunto e atualiza a situação. Pode adicionar uma foto de perfil.
- **Administrador:** acompanha os requerimentos, cadastra e exclui atendentes, define o acesso aos setores e pode excluir contas de agricultores.

Um requerimento concluído ou recusado mantém seu histórico disponível para consulta, mas não aceita novas mensagens enquanto estiver encerrado. Áudios são anexados e a transcrição depende do reconhecimento de voz do navegador e da conexão.

## Tecnologias

A interface usa React, Vite, CSS, Roboto e ícones do Google. O Supabase cuida da autenticação por e-mail e senha, banco PostgreSQL, armazenamento privado e funções de servidor. O GitHub Actions publica a versão compilada no GitHub Pages. O endereço é consultado pelo ViaCEP.

## Rodar no computador

Instale o Node.js e execute:

```bash
npm install
npm run dev
```

Crie `.env.local` na raiz com os dados públicos do projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
```

## Organização

- `src/`: telas, componentes e comunicação com Supabase.
- `public/`: arquivos públicos e favicon.
- `supabase/`: esquema inicial, migrações e funções de servidor.
- `test/`: testes automatizados.
- `docs/`: guia ilustrado e imagens.
- `.github/workflows/`: publicação automática no GitHub Pages.
