export function dashboardSummary(rows) {
 return { total:rows.length, received:rows.filter(r=>r.status==='Recebido').length, progress:rows.filter(r=>r.status==='Em andamento').length, done:rows.filter(r=>r.status==='Concluído').length };
}
export function isHomePath(path,base) {
 const normalize = value => value.length > 1 ? value.replace(/\/+$/, '') : value;
 return normalize(path) === normalize(base);
}
