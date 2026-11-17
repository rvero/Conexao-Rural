export async function submitEmailAuth(client, mode, email, password) {
  if (!client) throw new Error('Configure o Supabase antes de entrar.');
  const credentials = { email, password };
  const { data, error } = mode === 'signup'
    ? await client.auth.signUp(credentials)
    : await client.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
}
