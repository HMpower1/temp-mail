// Provision only this Temp Mail domain. Never sends mail or prints secrets.
import {readFile,writeFile} from 'node:fs/promises';
const file=new URL('../deploy/.env',import.meta.url);
let source=await readFile(file,'utf8');
const env=Object.fromEntries(source.split(/\r?\n/).filter(x=>x&&!x.startsWith('#')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)];}));
const key=process.env.MAILGUN_API_KEY||env.MAILGUN_API_KEY;
if(!key)throw new Error('Zapisz MAILGUN_API_KEY w deploy/.env.');
const domain='inbox.temp-mail.serwerbb.win',endpoint='https://temp-mail.serwerbb.win/api/webhooks/mailgun/json';
async function mg(path,method='GET',fields){const r=await fetch('https://api.eu.mailgun.net'+path,{method,headers:{Authorization:'Basic '+Buffer.from('api:'+key).toString('base64')},body:fields});if(!r.ok)throw new Error(`Mailgun ${method} ${path}: HTTP ${r.status}`);return r.json();}
let details;
try{details=await mg('/v4/domains/'+domain);}catch(e){if(!e.message.endsWith('HTTP 404'))throw e;await mg('/v4/domains','POST',new URLSearchParams({name:domain}));details=await mg('/v4/domains/'+domain);}
const signing=await mg('/v5/accounts/http_signing_key');
if(typeof signing.http_signing_key!=='string'||!signing.http_signing_key)throw new Error('Brak http_signing_key w odpowiedzi konta.');
function save(name,value){const line=name+'='+value;if(new RegExp('^'+name+'=.*$','m').test(source))source=source.replace(new RegExp('^'+name+'=.*$','m'),()=>line);else source+='\n'+line+'\n';}
save('MAILGUN_WEBHOOK_SIGNING_KEY',signing.http_signing_key);save('MAIL_INGRESS_READY','false');await writeFile(file,source);
const expression='match_recipient("^.*@inbox[.]temp-mail[.]serwerbb[.]win$")';
const routes=await mg('/v3/routes?limit=1000');const existing=routes.items?.find(r=>r.description==='Temp Mail receive-only');
const fields=new URLSearchParams({priority:'0',description:'Temp Mail receive-only',expression});fields.append('action',`forward("${endpoint}")`);fields.append('action','stop()');
await mg('/v3/routes'+(existing?'/'+existing.id:''),existing?'PUT':'POST',fields);
const token=await readFile('C:/Users/hmpow/Documents/Codex/2026-09-23/chc-skonfigurowa-m-j-domowy-serwer/server-infra/ddns/secrets/cloudflare_api_token.txt','utf8');
const zone='4ef76c894278eb1b99c103ff3c6a664b';
async function cf(path,method='GET',body){const r=await fetch('https://api.cloudflare.com/client/v4/zones/'+zone+'/dns_records'+path,{method,headers:{Authorization:'Bearer '+token.trim(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok||!d.success)throw new Error('Cloudflare DNS: HTTP '+r.status);return d.result;}
// Use the provider's exact records, never fabricate account-specific DKIM TXT.
const records=[...(details.receiving_dns_records||[]),...(details.sending_dns_records||[]).filter(r=>['TXT','CNAME'].includes(r.record_type))];
if(!records.some(r=>r.record_type==='MX'))throw new Error('Provider nie zwrócił rekordów MX.');
const manifest=[];
for(const r of records){const name=(r.name||domain).replace(/\.$/,'');if(name!==domain&&!name.endsWith('.'+domain))throw new Error('Rekord poza domeną Temp Mail.');const record={type:r.record_type,name,content:r.value,ttl:300,...(r.record_type==='MX'?{priority:Number(r.priority)}:{}),...(r.record_type==='CNAME'?{proxied:false}:{})};const current=await cf('?type='+record.type+'&name='+encodeURIComponent(name));const match=current.find(x=>x.content===record.content)||(['TXT','CNAME'].includes(record.type)?current[0]:undefined);await cf(match?'/'+match.id:'',match?'PUT':'POST',record);manifest.push(record);}
// Remove obsolete self-hosted MX only after the provider's records exist.
for(const r of await cf('?type=MX&name='+domain)){if(!manifest.some(m=>m.type==='MX'&&m.content.replace(/\.$/,'')===r.content.replace(/\.$/,'')))await cf('/'+r.id,'DELETE');}
await writeFile(new URL('../deploy/mailgun-dns.json',import.meta.url),JSON.stringify(manifest,null,2));
await mg('/v4/domains/'+domain+'/verify','PUT');
console.log('Domena, DNS i catch-all skonfigurowane. Zrestartuj receiver, sprawdź podpisany webhook i realną wiadomość. MAIL_INGRESS_READY nadal false do weryfikacji.');
