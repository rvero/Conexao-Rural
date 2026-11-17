import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startSocialLogin } from '../src/socialAuth.js';

test('starts OAuth with the selected provider and returns to the app', async () => {
 let actual;
 const client = { auth: { signInWithOAuth: async (options) => { actual = options; return { error: null }; } } };
 for (const provider of ['google', 'facebook', 'apple']) {
  await startSocialLogin(client, provider, 'http://localhost:5173/');
  assert.deepEqual(actual, { provider, options: { redirectTo: 'http://localhost:5173/' } });
 }
});
test('reports missing configuration or provider failure', async () => {
 await assert.rejects(() => startSocialLogin(null, 'google', 'http://localhost:5173/'), /Supabase/);
 await assert.rejects(() => startSocialLogin({auth:{signInWithOAuth:async()=>({error:new Error('indisponível')})}}, 'apple', 'http://localhost:5173/'), /indisponível/);
});
