export function formatCep(value) {
 const digits=value.replace(/\D/g,'').slice(0,8);
 return digits.length>5 ? `${digits.slice(0,5)}-${digits.slice(5)}` : digits;
}
export async function lookupCep(value, fetcher=fetch, signal) {
 const digits=value.replace(/\D/g,'');
 if(digits.length!==8) throw new Error('Informe um CEP com 8 dígitos.');
 let response;
 try { response=await fetcher(`https://viacep.com.br/ws/${digits}/json/`,{signal}); } catch(error) { if(error.name==='AbortError')throw error; throw new Error('Não foi possível consultar o CEP. Tente novamente.'); }
 if(!response.ok) throw new Error('Não foi possível consultar o CEP. Tente novamente.');
 const data=await response.json();
 if(data.erro) throw new Error('CEP não encontrado. Confira os números.');
 const city=String(data.localidade||'').trim(), state=String(data.uf||'').trim().toUpperCase();
 if(city.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()!=='santa cruz do capibaribe'||state!=='PE') throw new Error('Informe um CEP de Santa Cruz do Capibaribe, Pernambuco.');
 return {street:String(data.logradouro||'').trim(),neighborhood:String(data.bairro||'').trim(),city,state};
}
export function formatAddress(address,number,cep) {
 return [address.street.trim(), number.trim()?`nº ${number.trim()}`:'', address.neighborhood.trim(), `${address.city} - ${address.state}`, `CEP ${formatCep(cep)}`].filter(Boolean).join(', ');
}
