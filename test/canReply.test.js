import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canReply } from '../src/statusActions.js';
test('conversas encerradas não aceitam respostas',()=>{for(const status of ['Concluído','Recusado'])assert.equal(canReply(status),false)});
test('conversas abertas aceitam respostas',()=>{for(const status of ['Recebido','Em andamento'])assert.equal(canReply(status),true)});
