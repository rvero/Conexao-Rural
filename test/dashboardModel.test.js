import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dashboardSummary, isHomePath } from '../src/dashboardModel.js';
test('resumos contam todas as situações sem filtrar pela busca', () => {
 const rows=[{status:'Recebido'},{status:'Em andamento'},{status:'Concluído'},{status:'Recebido'}];
 assert.deepEqual(dashboardSummary(rows),{total:4,received:2,progress:1,done:1});
});
test('aceita apenas o endereço inicial configurado para a aplicação', () => {
 assert.equal(isHomePath('/Conexao-Rural/','/Conexao-Rural/'),true);
 assert.equal(isHomePath('/Conexao-Rural','/Conexao-Rural/'),true);
 assert.equal(isHomePath('/Conexao-Rural/inexistente','/Conexao-Rural/'),false);
 assert.equal(isHomePath('/','/'),true);
 assert.equal(isHomePath('/inexistente','/'),false);
});
