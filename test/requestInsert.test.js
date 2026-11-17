import { test } from 'node:test';
import assert from 'node:assert/strict';
import { insertRequest } from '../src/requestInsert.js';
test('cria protocolo sem exigir leitura do pedido no mesmo comando',async()=>{let row;const client={from(table){assert.equal(table,'requerimentos');return {insert:async value=>(row=value,{error:null})}}};const id=await insertRequest(client,'user-1',{title:'Água',body:'Descrição',category:'Água',community:'Centro',kind:'Individual'},()=> 'req-1');assert.equal(id,'req-1');assert.deepEqual(row,{id:'req-1',autor_id:'user-1',titulo:'Água',corpo:'Descrição',setor:'Água',comunidade:'Centro',tipo:'Individual'});});
test('propaga erro quando inserção é bloqueada',async()=>{const client={from:()=>({insert:async()=>({error:new Error('bloqueado')})})};await assert.rejects(()=>insertRequest(client,'u',{title:'x'},()=> 'id'),/bloqueado/)});
