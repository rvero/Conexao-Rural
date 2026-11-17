export function statusActions(status){
 if(status==='Em andamento')return {label:'Concluir',next:'Concluído',tone:'complete',canRefuse:true};
 if(status==='Concluído')return {label:'Concluído',next:null,tone:'complete',canRefuse:true};
 return {label:'Receber',next:'Em andamento',tone:'receive',canRefuse:status!=='Recusado'};
}
