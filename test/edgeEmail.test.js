import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import vm from 'node:vm';
const userId='11111111-1111-4111-8111-111111111111';
function setup({role='agricultor',passwordValid=true,loggedIn=true}={}){
 let handler,updates=[];
 const admin={from(){return {select(){return {eq(){return {async single(){return {data:{papel:role},error:null}}}}}}}},auth:{admin:{async updateUserById(id,changes){updates.push({id,changes});return {error:null}}}}};
 const createClient=(_url,key,opts)=>key==='secret'?admin:opts?.global?{auth:{async getUser(){return {data:{user:loggedIn?{id:userId,email:'antigo@example.com'}:null},error:loggedIn?null:new Error('not logged in')}}}}:{auth:{async signInWithPassword(){return {data:{user:passwordValid?{id:userId}:null},error:passwordValid?null:new Error('invalid')}}}};
 const deno={env:{get(name){return ({SUPABASE_URL:'https://example.test',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'secret'})[name]}},serve(fn){handler=fn}};
 const source=readFileSync('supabase/functions/alterar-email/index.ts','utf8');const code=transformSync(source,{loader:'ts',format:'cjs'}).code;
 vm.runInNewContext(code,{require:()=>({createClient}),exports:{},module:{exports:{}},Deno:deno,Response,Request,console});return {handler,updates};
}
const req=(email='novo@example.com',password='senha')=>new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer example','Content-Type':'application/json'},body:JSON.stringify({email,password})});
test('sem sessão não altera e-mail',async()=>{const s=setup({loggedIn:false});const res=await s.handler(req());assert.equal(res.status,401);assert.equal(s.updates.length,0)});
test('senha incorreta não altera e-mail',async()=>{const s=setup({passwordValid:false});const res=await s.handler(req());assert.equal(res.status,403);assert.equal(s.updates.length,0)});
test('atendente não pode usar alteração privilegiada de e-mail',async()=>{const s=setup({role:'atendente'});const res=await s.handler(req());assert.equal(res.status,403);assert.equal(s.updates.length,0)});
test('agricultor altera apenas a própria conta',async()=>{const s=setup();const res=await s.handler(req());assert.equal(res.status,200);assert.equal(s.updates.length,1);assert.equal(s.updates[0].id,userId);assert.equal(s.updates[0].changes.email,'novo@example.com');});
