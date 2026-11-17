export async function saveProfile(client,userId,profile){
 const nome=(profile.nome||'').trim();if(!nome)throw new Error('Informe seu nome.');
 const fields={nome};
 if(profile.endereco!==undefined){
  if(!profile.endereco.trim())throw new Error('Informe um endereço válido.');
  for(const key of ['endereco','cep','logradouro','bairro','numero','cidade','uf'])fields[key]=(profile[key]||'').trim();
 }
 const {data,error}=await client.from('perfis').update(fields).eq('id',userId).select('id').single();
 if(error)throw error;return data;
}
export async function changeCredentials(client,email,currentPassword,changes){
 if(!currentPassword)throw new Error('Informe a senha atual.');
 const {error:verifyError}=await client.auth.signInWithPassword({email,password:currentPassword});
 if(verifyError)throw new Error('Não foi possível confirmar a senha atual.');
 const {data,error}=await client.auth.updateUser(changes);
 if(error)throw error;return data;
}
export async function removeFarmer(client,userId,password){
 const {data,error}=await client.functions.invoke('excluir-agricultor',{body:password?{userId,password}:{userId}});
 if(error)throw error;return data;
}
export async function changeEmail(client,email,currentPassword){
 if(!email.trim()||!currentPassword)throw new Error('Informe o novo e-mail e a senha atual.');
 const {data,error}=await client.functions.invoke('alterar-email',{body:{email:email.trim(),password:currentPassword}});
 if(error)throw error;
 const refreshed=await client.auth.refreshSession();
 if(refreshed.error)throw new Error('O e-mail foi alterado; entre novamente para atualizar a sessão.');
 return data;
}
