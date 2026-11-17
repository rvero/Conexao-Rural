import { createClient } from 'npm:@supabase/supabase-js@2';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' };
const respond = (status: number, message: string) => new Response(JSON.stringify({ message }), { status, headers });
Deno.serve(async req => {
 if (req.method === 'OPTIONS') return new Response('ok', { headers });
 if (req.method !== 'POST') return respond(405, 'Método não permitido.');
 const url=Deno.env.get('SUPABASE_URL'), anon=Deno.env.get('SUPABASE_ANON_KEY'), secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), authorization=req.headers.get('Authorization');
 if(!url||!anon||!secret||!authorization) return respond(401,'Não autorizado.');
 const caller=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
 const {data:{user},error:authError}=await caller.auth.getUser();
 if(authError||!user)return respond(401,'Não autorizado.');
 let body;try{body=await req.json()}catch{return respond(400,'Dados inválidos.');}
 const target=typeof body.userId==='string'?body.userId:'';
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target))return respond(400,'Conta inválida.');
 const admin=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:profiles,error:profileError}=await admin.from('perfis').select('id,papel').in('id',[user.id,target]);
 if(profileError)return respond(500,'Não foi possível verificar a conta.');
 const actor=profiles?.find(p=>p.id===user.id), victim=profiles?.find(p=>p.id===target);
 if(!actor||!victim||victim.papel!=='atendente'||actor.papel!=='administrador')return respond(403,'Sem permissão para excluir esta conta.');
 try{
  // Copia anexos preservados sob uma chave sem identificação do usuário e remove o original.
  for(let batch=0;batch<100;batch++){
   const {data:objects,error:objectsError}=await admin.rpc('objetos_da_conta',{alvo:target});
   if(objectsError)throw objectsError;
   if(!objects?.length)break;
   for(const object of objects){
    if(object.bucket==='requerimentos'){
     const {data:attachment,error:readError}=await admin.from('anexos').select('id,requerimento_id').eq('caminho',object.caminho).maybeSingle();
     if(readError)throw readError;
     if(attachment){
      const newPath=`${attachment.requerimento_id}/anonimo/${crypto.randomUUID()}`;
      const {error:copyError}=await admin.storage.from('requerimentos').copy(object.caminho,newPath);if(copyError)throw copyError;
      const {error:moveError}=await admin.from('anexos').update({caminho:newPath}).eq('id',attachment.id);if(moveError)throw moveError;
     }
    }else if(object.bucket!=='perfis')throw new Error('A conta possui arquivos em um armazenamento não previsto.');
    const {error:removeError}=await admin.storage.from(object.bucket).remove([object.caminho]);if(removeError)throw removeError;
   }
  }
  const {data:remaining,error:remainingError}=await admin.rpc('objetos_da_conta',{alvo:target});
  if(remainingError||remaining?.length)throw new Error('Ainda existem arquivos vinculados à conta.');
  const {error:deleteError}=await admin.auth.admin.deleteUser(target);if(deleteError)throw deleteError;
  return respond(200,'Conta excluída. Requerimentos e anexos foram preservados.');
 }catch(error){console.error('Falha ao excluir atendente',error instanceof Error?error.message:'erro desconhecido');return respond(500,'Não foi possível concluir a exclusão. Alguns arquivos podem já ter sido reorganizados; tente novamente ou contate o responsável pelo sistema.');}
});
