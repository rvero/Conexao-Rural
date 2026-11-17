export async function insertRequest(client,userId,form,generateId=()=>crypto.randomUUID()){
 const id=generateId();
 const {error}=await client.from('requerimentos').insert({id,autor_id:userId,titulo:form.title,corpo:form.body,setor:form.category,comunidade:form.community,tipo:form.kind});
 if(error)throw error;
 return id;
}
