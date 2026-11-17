import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
const actor='11111111-1111-4111-8111-111111111111', target='22222222-2222-4222-8222-222222222222', request='33333333-3333-4333-8333-333333333333';
function setup({role='administrador',victim='agricultor',passwordValid=true,copyFails=false,files=true}={}){
 let handler,deleted=false;const actions=[];const objects=files?[{bucket:'requerimentos',caminho:`${request}/${target}/foto`}]:[];
 const admin={auth:{admin:{async deleteUser(id){actions.push(['deleteUser',id]);deleted=true;return {error:null}}}},
  async rpc(){return {data:[...objects],error:null}},
  from(table){if(table==='perfis')return {select(){return {async in(){return {data:[{id:actor,papel:role},{id:target,papel:victim}],error:null}}}}};
   if(table==='anexos')return {select(){return {eq(){return {async maybeSingle(){return {data:{id:'anexo',requerimento_id:request},error:null}}}}}},update(values){return {async eq(){actions.push(['metadata',values.caminho]);return {error:null}}}}};throw Error('unexpected table')},
  storage:{from(bucket){return {async copy(from,to){actions.push(['copy',from,to]);return {error:copyFails?new Error('falha'):null}},async remove(paths){actions.push(['remove',bucket,paths]);objects.splice(0,objects.length);return {error:null}}}}}
 };
 const createClient=(_url,key,opts)=>key==='secret'?admin:opts?.global?{auth:{async getUser(){return {data:{user:{id:actor,email:'a@example.com'}},error:null}}}}:{auth:{async signInWithPassword(){return {data:{user:passwordValid?{id:actor}:null},error:passwordValid?null:new Error('invalid')}}}};
 const deno={env:{get(name){return ({SUPABASE_URL:'https://example.test',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'secret'})[name]}},serve(fn){handler=fn}};
 const source=readFileSync('supabase/functions/excluir-agricultor/index.ts','utf8');const code=transformSync(source,{loader:'ts',format:'cjs'}).code;
 vm.runInNewContext(code,{require:()=>({createClient}),exports:{},module:{exports:{}},Deno:deno,Response,Request,crypto:webcrypto,console});
 return {handler,actions,wasDeleted:()=>deleted};
}
const post=(userId,password)=>new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer example','Content-Type':'application/json'},body:JSON.stringify({userId,password})});
test('nega exclusão de outro agricultor por usuário comum',async()=>{let s=setup({role:'agricultor'});let res=await s.handler(post(target));assert.equal(res.status,403);assert.equal(s.wasDeleted(),false);assert.equal(s.actions.length,0)});
test('nega exclusão de conta administrativa',async()=>{let s=setup({victim:'administrador'});let res=await s.handler(post(target));assert.equal(res.status,403);assert.equal(s.wasDeleted(),false)});
test('nega autoexclusão com senha incorreta',async()=>{let s=setup({role:'agricultor',passwordValid:false});let res=await s.handler(post(actor,'errada'));assert.equal(res.status,403);assert.equal(s.wasDeleted(),false)});
test('preserva anexo antes de remover a conta',async()=>{let s=setup();let res=await s.handler(post(target));assert.equal(res.status,200);assert.deepEqual(s.actions.map(x=>x[0]),['copy','metadata','remove','deleteUser']);assert.match(s.actions[0][2],/\/anonimo\//);assert.equal(s.wasDeleted(),true)});
test('falha ao copiar impede exclusão da conta e do arquivo',async()=>{let s=setup({copyFails:true});let res=await s.handler(post(target));assert.equal(res.status,500);assert.deepEqual(s.actions.map(x=>x[0]),['copy']);assert.equal(s.wasDeleted(),false)});
