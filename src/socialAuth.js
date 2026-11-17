export async function startSocialLogin(client, provider, redirectTo) {
  if (!client) throw new Error('Configure a URL e a chave pública do Supabase.');
  const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo } });
  if (error) throw error;
}
