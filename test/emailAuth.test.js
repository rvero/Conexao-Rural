import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitEmailAuth } from '../src/emailAuth.js';
test('cadastro inclui nome e endereço; login envia apenas email e senha', async () => {
 let called;
 const client={auth:{signUp:async x=>(called=['signup',x],{data:{session:null},error:null}),signInWithPassword:async x=>(called=['login',x],{data:{session:{}},error:null})}};
 await submitEmailAuth(client,'signup','user@example.com','secret123',{nome:' Ana Silva ',endereco:' Rua A, 12 '});
 assert.deepEqual(called,['signup',{email:'user@example.com',password:'secret123',options:{data:{nome:'Ana Silva',endereco:'Rua A, 12'}}}]);
 await submitEmailAuth(client,'login','user@example.com','secret123');
 assert.deepEqual(called,['login',{email:'user@example.com',password:'secret123'}]);
});
test('cadastro exige nome e endereço',async()=>{await assert.rejects(()=>submitEmailAuth({auth:{}},'signup','u@e.com','123456',{nome:'  ',endereco:'Rua A'}),/nome/i);await assert.rejects(()=>submitEmailAuth({auth:{}},'signup','u@e.com','123456',{nome:'Ana',endereco:' '}),/endereço/i)});
test('propaga falhas',async()=>{await assert.rejects(()=>submitEmailAuth(null,'login','a@b.com','123456'),/Supabase/);await assert.rejects(()=>submitEmailAuth({auth:{signInWithPassword:async()=>({error:new Error('falhou')})}},'login','a@b.com','123456'),/falhou/)});
