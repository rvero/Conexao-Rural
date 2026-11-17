import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechTranscriber } from '../src/speech.js';
class FakeSpeech { constructor(){FakeSpeech.last=this;this.starts=0}start(){this.starts++}stop(){this.onend?.()} }
test('escreve somente resultados finais sem repetir resultados anteriores',()=>{let parts=[];let speech=createSpeechTranscriber(FakeSpeech,{onText:t=>parts.push(t)});speech.start();FakeSpeech.last.onresult({resultIndex:1,results:[{0:{transcript:'antigo'},isFinal:true},{0:{transcript:' água '},isFinal:true},{0:{transcript:'parcial'},isFinal:false}]});assert.deepEqual(parts,['água']);});
test('reinicia quando o navegador encerra o reconhecimento durante a gravação',async()=>{let speech=createSpeechTranscriber(FakeSpeech,{onText:()=>{},retryDelay:0});speech.start();FakeSpeech.last.onend();await new Promise(r=>setTimeout(r,10));assert.equal(FakeSpeech.last.starts,2);await speech.stop();FakeSpeech.last.onend();await new Promise(r=>setTimeout(r,10));assert.equal(FakeSpeech.last.starts,2)});
test('informa falha e encerra com segurança',async()=>{let errors=[];let speech=createSpeechTranscriber(FakeSpeech,{onText:()=>{},onError:e=>errors.push(e)});speech.start();FakeSpeech.last.onerror({error:'network'});await speech.stop();assert.equal(errors.length,1)});
