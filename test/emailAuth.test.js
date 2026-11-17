import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitEmailAuth } from '../src/emailAuth.js';
test('uses Supabase email signup and password sign in', async () => {
 let called;
 const client = { auth: { signUp: async x => (called=['signup',x], { data:{session:null}, error:null }), signInWithPassword: async x => (called=['login',x], {data:{session:{}}, error:null}) } };
 await submitEmailAuth(client, 'signup', 'user@example.com', 'secret123');
 assert.deepEqual(called,['signup',{email:'user@example.com',password:'secret123'}]);
 await submitEmailAuth(client, 'login', 'user@example.com', 'secret123');
 assert.deepEqual(called,['login',{email:'user@example.com',password:'secret123'}]);
});
test('propagates failures', async () => {
 await assert.rejects(()=>submitEmailAuth(null,'login','a@b.com','123456'),/Supabase/);
 await assert.rejects(()=>submitEmailAuth({auth:{signInWithPassword:async()=>({error:new Error('falhou')})}},'login','a@b.com','123456'),/falhou/);
});
