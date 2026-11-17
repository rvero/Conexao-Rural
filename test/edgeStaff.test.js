import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
const actor='11111111-1111-4111-8111-111111111111', target='22222222-2222-4222-8222-222222222222', request='33333333-3333-4333-8333-333333333333';
function setup({role='administrador',victim='atendente',passwordValid=true,copyFails=false,files=true}={}){
 let handler,deleted=false;const actions=[];const objects=files?[{bucket:'requerimentos',caminho:`${request}/${target}/foto`}]:[];
 const admin={auth:{admin:{async deleteUser(id){actions.push(['deleteUser',id]);deleted=true;return {error:null}}}},
  async rpc(){return {data:[...objects],error:null}},
  from(table){if(table==='perfis')return {select(){return {async in(){return {data:[{id:actor,papel:role},{id:target,papel:victim}],error:null}}}}};
   if(table==='anexos')return {select(){return {eq(){return {async maybeSingle(){return {data:{id:'anexo',requerimento_id:request},error:null}}}}}},update(values){return {async eq(){actions.push(['metadata',values.caminho]);return {error:null}}}}};throw Error('unexpected table')},
  storage:{from(bucket){return {async copy(from,to){actions.push(['copy',from,to]);return {error:copyFails?new Error('falha'):null}},async remove(paths){actions.push(['remove',bucket,paths]);objects.splice(0,objects.length);return {error:null}}}}}
 };
 const createClient=(_url,key,opts)=>key==='secret'?admin:opts?.global?{auth:{async getUser(){return {data:{user:{id:actor,email:'a@example.com'}},error:null}}}}:{auth:{async signInWithPassword(){return {data:{user:passwordValid?{id:actor}:null},error:passwordValid?null:new Error('invalid')}}}};
 const deno={env:{get(name){return ({SUPABASE_URL:'https://example.test',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'secret'})[name]}},serve(fn){handler=fn}};
 const source=readFileSync('supabase/functions/excluir-atendente/index.ts','utf8');const code=transformSync(source,{loader:'ts',format:'cjs'}).code;
 vm.runInNewContext(code,{require:()=>({createClient}),exports:{},module:{exports:{}},Deno:deno,Response,Request,crypto:webcrypto,console});
 return {handler,actions,wasDeleted:()=>deleted};
}
const post=(userId,password)=>new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer example','Content-Type':'application/json'},body:JSON.stringify({userId,password})});
test('somente administrador pode excluir atendente',async()=>{for(const role of ['agricultor','atendente']){const s=setup({role});const res=await s.handler(post(target));assert.equal(res.status,403);assert.equal(s.wasDeleted(),false)}});
test('administrador não pode excluir agricultor ou outro administrador por esta função',async()=>{for(const victim of ['agricultor','administrador']){const s=setup({victim});const res=await s.handler(post(target));assert.equal(res.status,403);assert.equal(s.wasDeleted(),false)}});
test('exclusão do atendente preserva anexos antes de apagar a conta',async()=>{const s=setup();const res=await s.handler(post(target));assert.equal(res.status,200);assert.deepEqual(s.actions.map(x=>x[0]),['copy','metadata','remove','deleteUser'])});
test('falha na preservação impede exclusão',async()=>{const s=setup({copyFails:true});const res=await s.handler(post(target));assert.equal(res.status,500);assert.equal(s.wasDeleted(),false)});
