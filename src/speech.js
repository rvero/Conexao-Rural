export function createSpeechTranscriber(Speech,{onText,onError=()=>{},retryDelay=300,timeoutMs=4000}) {
 const recognition=new Speech();recognition.lang='pt-BR';recognition.continuous=true;recognition.interimResults=false;
 let active=false, stopping=false, ended=false, restartTimer, finish, timeout, failures=0, heard=false;
 const done=new Promise(resolve=>{finish=()=>{if(ended)return;ended=true;clearTimeout(timeout);clearTimeout(restartTimer);resolve(heard)}});
 recognition.onresult=event=>{let parts=[];for(let i=event.resultIndex;i<event.results.length;i++){const r=event.results[i];if(r.isFinal&&r[0]?.transcript?.trim())parts.push(r[0].transcript.trim())}if(parts.length){heard=true;failures=0;onText(parts.join(' '))}};
 recognition.onerror=event=>{if(event.error==='no-speech'&&!stopping)return;if(stopping&&event.error==='aborted')return;active=false;onError(event.error||'unknown');finish()};
 recognition.onend=()=>{if(stopping||!active){finish();return}if(++failures>5){active=false;onError('interrupted');finish();return}restartTimer=setTimeout(()=>{if(active&&!stopping){try{recognition.start()}catch{active=false;onError('interrupted');finish()}}},retryDelay)};
 return {
  start(){active=true;try{recognition.start()}catch{active=false;onError('start');finish()}},
  stop(){if(ended)return done;stopping=true;active=false;clearTimeout(restartTimer);timeout=setTimeout(()=>{onError('timeout');finish()},timeoutMs);try{recognition.stop()}catch{finish()}return done}
 };
}
