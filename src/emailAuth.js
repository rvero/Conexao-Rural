export async function submitEmailAuth(client, mode, email, password, profile = {}) {
  if (!client) throw new Error('Configure o Supabase antes de entrar.');
  const credentials = { email, password };
  if (mode === 'signup') {
    const nome = (profile.nome || '').trim();
    const endereco = (profile.endereco || '').trim();
    if (!nome) throw new Error('Informe seu nome.');
    if (!endereco) throw new Error('Informe seu endereço.');
    credentials.options = { data: { nome, endereco } };
  }
  const { data, error } = mode === 'signup'
    ? await client.auth.signUp(credentials)
    : await client.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
}
