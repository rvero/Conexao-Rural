import { createClient } from 'npm:@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const respond=(status:number,message:string)=>new Response(JSON.stringify({message}),{status,headers:cors});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return respond(405,'Método não permitido.');
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_ANON_KEY'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),authorization=req.headers.get('Authorization');
 if(!url||!key||!secret||!authorization)return respond(401,'Não autorizado.');
 const caller=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await caller.auth.getUser();if(error||!user||!user.email)return respond(401,'Não autorizado.');
 let input;try{input=await req.json()}catch{return respond(400,'Dados inválidos.');}
 const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';const password=input.password;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||!password)return respond(400,'Informe um e-mail e a senha atual.');
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:profile,error:profileError}=await admin.from('perfis').select('papel').eq('id',user.id).single();
 if(profileError||profile?.papel!=='agricultor')return respond(403,'Operação permitida apenas para agricultores.');
 const verifier=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:verified,error:verifyError}=await verifier.auth.signInWithPassword({email:user.email,password});
 if(verifyError||verified.user?.id!==user.id)return respond(403,'Não foi possível confirmar a senha atual.');
 const {error:updateError}=await admin.auth.admin.updateUserById(user.id,{email,email_confirm:true});
 if(updateError)return respond(400,'Não foi possível alterar o e-mail. Verifique se ele já está em uso.');
 return respond(200,'E-mail alterado.');
});
