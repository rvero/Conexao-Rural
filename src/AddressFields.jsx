import React, { useEffect, useRef, useState } from 'react';
import { formatCep, lookupCep, formatAddress } from './cep';

export default function AddressFields({ onChange }) {
 const [cep,setCep]=useState('');
 const [address,setAddress]=useState(null);
 const [missing,setMissing]=useState({street:false,neighborhood:false});
 const [number,setNumber]=useState('');
 const [status,setStatus]=useState('idle');
 const [error,setError]=useState('');
 const [retry,setRetry]=useState(0);
 const onChangeRef=useRef(onChange); onChangeRef.current=onChange;
 const valid=status==='success' && address && address.street.trim() && address.neighborhood.trim();
 useEffect(()=>{onChangeRef.current(valid ? formatAddress(address,number,cep) : '',Boolean(valid),valid ? {cep:formatCep(cep),logradouro:address.street.trim(),bairro:address.neighborhood.trim(),numero:number.trim(),cidade:address.city,uf:address.state} : null)},[address,number,cep,valid]);
 useEffect(()=>{
  const digits=cep.replace(/\D/g,'');
  setAddress(null);setError('');
  if(digits.length!==8){setStatus('idle');return}
  const controller=new AbortController();let active=true;
  setStatus('loading');
  lookupCep(digits,fetch,controller.signal).then(result=>{if(!active)return;setAddress(result);setMissing({street:!result.street,neighborhood:!result.neighborhood});setStatus('success')}).catch(err=>{if(!active||err.name==='AbortError')return;setAddress(null);setError(err.message);setStatus('error')});
  return()=>{active=false;controller.abort()};
 },[cep,retry]);
 return <div className="fields addressFields">
  <label>CEP<input required inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={cep} onChange={e=>setCep(formatCep(e.target.value))} maxLength="9" aria-describedby="cep-status"/></label>
  <div id="cep-status" role="status" className={status==='error'?'authError':'muted'}>{status==='loading'?'Consultando CEP...':error || 'Informe um CEP de Santa Cruz do Capibaribe, PE.'}</div>
  {status==='error'&&<button type="button" className="textButton" onClick={()=>setRetry(x=>x+1)}>Tentar consultar novamente</button>}
  {address&&<>
   <label>Rua<input required value={address.street} readOnly={!missing.street} autoComplete="address-line1" onChange={e=>setAddress({...address,street:e.target.value})}/>{missing.street&&<small>O CEP não informou a rua. Preencha este campo.</small>}</label>
   <label>Bairro<input required value={address.neighborhood} readOnly={!missing.neighborhood} onChange={e=>setAddress({...address,neighborhood:e.target.value})}/>{missing.neighborhood&&<small>O CEP não informou o bairro. Preencha este campo.</small>}</label>
   <label>Cidade / Estado<input readOnly value={`${address.city} - ${address.state}`}/></label>
   <label>Número <small>(opcional)</small><input value={number} maxLength="30" autoComplete="address-line2" onChange={e=>setNumber(e.target.value)} placeholder="Número da residência"/></label>
  </>}
 </div>;
}
