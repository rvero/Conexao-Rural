# Conexão Rural

Protótipo React para o atendimento de comunidades rurais de Santa Cruz do Capibaribe. A interface foi inspirada nos materiais fornecidos e utiliza Roboto e Material Symbols do Google.

## Executar

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite. Para gerar a versão de produção, execute `npm run build`.

## Estado da implementação

A aplicação é uma demonstração local. O cadastro e login por e-mail usam Supabase Auth. O seletor no cabeçalho simula os três perfis e não oferece proteção de acesso aos dados. Requerimentos, atendentes e fotos são mantidos no armazenamento do navegador, sujeitos ao limite de espaço, e não são compartilhados com outras pessoas ou dispositivos. Não utilize dados reais. A gravação usa a permissão do microfone; a transcrição depende da API de reconhecimento de voz do navegador e pode não estar disponível. A foto aparece nas respostas criadas depois da escolha da imagem. O cadastro de atendentes é simulado e não cria contas reais.

## Próxima etapa: Supabase

Criar um projeto Supabase e integrar Auth (telefone ou e-mail para agricultores e conta de atendente), PostgreSQL (perfis, setores, permissões, requerimentos e mensagens) e Storage privado (anexos e fotos). Aplicar políticas RLS no banco e no Storage para assegurar acesso por agricultor, setor e administrador. A criação de contas de atendente deve ocorrer em função de servidor autorizada, sem expor chaves privilegiadas ao navegador. O domínio `@rural.com` é ilustrativo: e-mails de confirmação e recuperação exigem um domínio de e-mail controlado ou outro fluxo de acesso. O login por SMS pode exigir provedor externo. A transcrição confiável pode exigir um serviço de transcrição dedicado.

## GitHub Pages

Em Settings > Pages, selecione GitHub Actions como fonte de publicação. O workflow compila e publica o projeto. No Supabase Authentication > URL Configuration, configure a Site URL para `https://rvero.github.io/Conexao-Rural/` e autorize esse endereço em Redirect URLs para confirmação de e-mail. A chave pública no workflow é incluída no aplicativo distribuído; a proteção dos dados deve ser feita com políticas RLS.
