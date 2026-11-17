import { createClient } from 'npm:@supabase/supabase-js@2';
const allowed = ['Água','Energia','Estradas','Assistência técnica','Outros'];
Deno.serve(async (req) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  const response = (status: number, message: string) => new Response(JSON.stringify({ message }), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return response(405, 'Método não permitido.');
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = req.headers.get('Authorization');
  if (!url || !anon || !secret || !authorization) return response(401, 'Não autorizado.');
  const caller = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: userError } = await caller.auth.getUser();
  if (userError || !user) return response(401, 'Não autorizado.');
  const { data: profile, error: profileError } = await caller.from('perfis').select('papel').eq('id', user.id).single();
  if (profileError || profile?.papel !== 'administrador') return response(403, 'Apenas administradores podem criar atendentes.');
  let body;
  try { body = await req.json(); } catch { return response(400, 'Dados inválidos.'); }
  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const login = typeof body.login === 'string' ? body.login.trim().toLowerCase() : '';
  const senha = body.senha;
  const setores = body.setores;
  if (!nome || nome.length > 150 || !/^[a-z0-9._-]{1,64}$/.test(login) || typeof senha !== 'string' || senha.length < 8 || senha.length > 128 || !Array.isArray(setores) || setores.length === 0 || setores.some((s: string) => !allowed.includes(s)) || new Set(setores).size !== setores.length) return response(400, 'Confira nome, login, senha e setores.');
  const admin = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin.auth.admin.createUser({ email: `${login}@rural.com`, password: senha, email_confirm: true, user_metadata: { nome } });
  if (error || !data.user) return response(400, 'Não foi possível criar a conta. Verifique se o login já existe.');
  const id = data.user.id;
  const { error: profileUpdateError } = await admin.from('perfis').update({ papel:'atendente', nome }).eq('id',id);
  const { error: sectorsError } = profileUpdateError ? { error: profileUpdateError } : await admin.from('setores_atendente').insert(setores.map((setor: string) => ({ usuario_id:id, setor })));
  if (sectorsError) { await admin.auth.admin.deleteUser(id); return response(500, 'Não foi possível concluir o cadastro.'); }
  return response(201, 'Atendente criado.');
});
