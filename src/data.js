import { supabase } from './supabaseClient';
import { insertRequest } from './requestInsert';
import { decodeAttachment, sendReply } from './replyAttachments';

function check(result) { if (result.error) throw result.error; return result.data; }
const date = value => new Date(value).toLocaleDateString('pt-BR');
async function signed(bucket, path) { if (!path) return null; const result = await supabase.storage.from(bucket).createSignedUrl(path, 3600); return result.error ? null : result.data.signedUrl; }
export async function loadDashboard(userId) {
  const [profileResult, requestResult, messageResult, attachmentResult, profileListResult, sectorsResult] = await Promise.all([
    supabase.from('perfis').select('*').eq('id', userId).single(),
    supabase.from('requerimentos').select('*').order('criado_em', { ascending: false }),
    supabase.from('mensagens').select('*').order('criado_em'),
    supabase.from('anexos').select('*').order('criado_em'),
    supabase.from('perfis').select('id,nome,papel,foto_caminho'),
    supabase.from('setores_atendente').select('*')
  ]);
  const profile=check(profileResult), requests=check(requestResult), messages=check(messageResult), attachments=check(attachmentResult), profiles=check(profileListResult), sectors=check(sectorsResult);
  const people=Object.fromEntries(await Promise.all(profiles.map(async p=>[p.id,{...p,photo:await signed('perfis',p.foto_caminho)}])));
  const mapped=await Promise.all(requests.map(async r=>{
    const files=(await Promise.all(attachments.filter(a=>a.requerimento_id===r.id).map(async a=>({...decodeAttachment(a.nome),data:await signed('requerimentos',a.caminho)})))).filter(a=>a.data);
    return {id:r.id,title:r.titulo,body:r.corpo,category:r.setor,community:r.comunidade,kind:r.tipo,status:r.situacao,date:date(r.criado_em),name:people[r.autor_id]?.nome || 'Conta excluída',messages:messages.filter(m=>m.requerimento_id===r.id).map(m=>({id:m.id,name:people[m.autor_id]?.nome || 'Conta excluída',photo:people[m.autor_id]?.photo,text:m.corpo,date:date(m.criado_em),files:files.filter(f=>f.messageId?.toLowerCase()===m.id.toLowerCase())})),files:files.filter(f=>!f.messageId)};
  }));
  return {profile, items:mapped, staff:profiles.filter(p=>p.papel==='atendente').map(p=>({id:p.id,name:p.nome,sectors:sectors.filter(s=>s.usuario_id===p.id).map(s=>s.setor)})), farmers:profiles.filter(p=>p.papel==='agricultor').map(p=>({id:p.id,name:p.nome})), photo:people[userId]?.photo, assignedSectors:sectors.filter(s=>s.usuario_id===userId).map(s=>s.setor)};
}
export async function createRequest(userId, form) {
 const id=await insertRequest(supabase,userId,form);
 for (const file of form.files) {
  const blob=await (await fetch(file.data)).blob();
  const path=`${id}/${userId}/${crypto.randomUUID()}`;
  const uploaded=await supabase.storage.from('requerimentos').upload(path,blob,{contentType:blob.type || 'application/octet-stream'});check(uploaded);
  const metadata=await supabase.from('anexos').insert({requerimento_id:id,autor_id:userId,nome:file.name,caminho:path});check(metadata);
 }
 return id;
}
export async function updateRequest(id, patch) { const values={}; if(patch.category)values.setor=patch.category;if(patch.status)values.situacao=patch.status;check(await supabase.from('requerimentos').update(values).eq('id',id)); }
export async function createMessage(id,userId,text,files=[]) {return sendReply(supabase,id,userId,text,files);}
export async function uploadPhoto(userId,file) {const path=`${userId}/${crypto.randomUUID()}`;check(await supabase.storage.from('perfis').upload(path,file,{contentType:file.type}));check(await supabase.from('perfis').update({foto_caminho:path}).eq('id',userId));}
export async function createStaff(person) {const {data,error}=await supabase.functions.invoke('criar-atendente',{body:{nome:person.name,login:person.email,senha:person.password,setores:person.sectors}});if(error)throw error;return data;}

export async function setStaffSector(userId, sector, enabled) { const query=supabase.from('setores_atendente'); if(enabled) check(await query.insert({usuario_id:userId,setor:sector})); else check(await query.delete().eq('usuario_id',userId).eq('setor',sector)); }
