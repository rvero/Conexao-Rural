const marker=/^@resposta:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):([\s\S]*)$/i;
export function encodeReplyAttachment(messageId,name){return `@resposta:${messageId}:${name}`;}
export function decodeAttachment(name){const match=marker.exec(name||'');return match?{messageId:match[1],name:match[2]}:{messageId:null,name:name||'Anexo'};}
export async function sendReply(client,requestId,userId,text,files,{uuid=()=>crypto.randomUUID(),fetcher=fetch}={}){
 if(!text.trim()&&!files.length)throw new Error('Escreva uma resposta ou adicione um anexo.');
 const id=uuid();const {error}=await client.from('mensagens').insert({id,requerimento_id:requestId,autor_id:userId,corpo:text.trim()||'Anexo enviado.'});if(error)throw error;
 try{for(const file of files){const blob=await (await fetcher(file.data)).blob();const path=`${requestId}/${userId}/${uuid()}`;const uploaded=await client.storage.from('requerimentos').upload(path,blob,{contentType:blob.type||'application/octet-stream'});if(uploaded.error)throw uploaded.error;const metadata=await client.from('anexos').insert({requerimento_id:requestId,autor_id:userId,nome:encodeReplyAttachment(id,file.name),caminho:path});if(metadata.error)throw metadata.error;}}
 catch(error){const wrapped=new Error('A resposta foi enviada, mas um ou mais anexos não foram salvos. Confira a conversa antes de reenviar.');wrapped.messageCreated=true;wrapped.cause=error;throw wrapped;}
 return id;
}
