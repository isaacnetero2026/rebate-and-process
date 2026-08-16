const DB_KEY='processHubStandalone_v1';
let DB=null;
async function sha256(text){const b=new TextEncoder().encode(String(text));const h=await crypto.subtle.digest('SHA-256',b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function initDB(){const saved=localStorage.getItem(DB_KEY);if(saved){try{DB=JSON.parse(saved);return DB}catch(e){localStorage.removeItem(DB_KEY)}}const [u,h]=await Promise.all([fetch('data/users.seed.json').then(r=>r.json()),fetch('data/history.seed.json').then(r=>r.json())]);DB={users:u,history:h,createdAt:new Date().toISOString()};saveDB();return DB}
function saveDB(){localStorage.setItem(DB_KEY,JSON.stringify(DB))}
function localHistory(){return DB.history||[]}
function addHistory(text,user,level,superior){DB.history.push({Timestamp:new Date().toISOString(),User:user,Level:level,'Result Output':text,Superior:superior||'N/A',_local:true});saveDB()}
function exportDB(){const blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='process-hub-backup.json';a.click();URL.revokeObjectURL(a.href)}
