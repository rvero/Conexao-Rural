import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusActions } from '../src/statusActions.js';
test('receber inicia atendimento e exibe ação para concluir',()=>{assert.deepEqual(statusActions('Recebido'),{label:'Receber',next:'Em andamento',tone:'receive',canRefuse:true});assert.deepEqual(statusActions('Em andamento'),{label:'Concluir',next:'Concluído',tone:'complete',canRefuse:true})});
test('identifica resultado concluído e permite reabrir pedido recusado',()=>{assert.deepEqual(statusActions('Concluído'),{label:'Concluído',next:null,tone:'complete',canRefuse:true});assert.deepEqual(statusActions('Recusado'),{label:'Receber',next:'Em andamento',tone:'receive',canRefuse:false})});
