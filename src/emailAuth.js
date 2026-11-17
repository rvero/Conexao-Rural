export async function submitEmailAuth(client, mode, email, password, profile = {}) {
  if (!client) throw new Error('Configure o Supabase antes de entrar.');
  const credentials = { email, password };
  if (mode === 'signup') {
    const nome = (profile.nome || '').trim();
    const endereco = (profile.endereco || '').trim();
    if (!nome) throw new Error('Informe seu nome.');
    if (!endereco) throw new Error('Informe seu endereço.');
    const detalhes = profile.detalhes || {};
    const data = { nome, endereco };
    for (const key of ['cep', 'logradouro', 'bairro', 'numero', 'cidade', 'uf']) {
      if (typeof detalhes[key] === 'string') data[key] = detalhes[key].trim();
    }
    credentials.options = { data };
  }
  const { data, error } = mode === 'signup'
    ? await client.auth.signUp(credentials)
    : await client.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
}
