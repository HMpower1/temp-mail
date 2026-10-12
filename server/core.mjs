import { randomBytes, randomUUID, createHash, timingSafeEqual } from 'node:crypto';
import sanitizeHtml from 'sanitize-html';
export const HOUR = 3600000;
export const MAX_MESSAGE = 2 * 1024 * 1024;
export const MAX_ATTACHMENT = 1024 * 1024;
export class MailError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const digest = value => createHash('sha256').update(value).digest('hex');
export const sameSecret = (a, b) => typeof a === 'string' && typeof b === 'string' && timingSafeEqual(Buffer.from(digest(a)), Buffer.from(digest(b)));
export const cleanHtml = html => sanitizeHtml(String(html || '').slice(0, MAX_MESSAGE), {
 allowedTags: ['p','br','div','span','strong','b','i','em','u','s','ul','ol','li','blockquote','pre','code','h1','h2','h3','h4','table','thead','tbody','tr','th','td','hr'],
 allowedAttributes: {}, disallowedTagsMode: 'discard', enforceHtmlBoundary: true,
 nonTextTags: ['script','style','textarea','option','iframe','object','svg','math']
});
export class Limiter {
 constructor(clock = Date.now, maxKeys = 20000) { this.clock = clock; this.entries = new Map(); this.maxKeys = maxKeys; }
 take(key, limit, period) {
  const now = this.clock(); const current = this.entries.get(key);
  if (!current || current.until <= now) {
   for (const [k,v] of this.entries) if (v.until <= now) this.entries.delete(k);
   if (this.entries.size >= this.maxKeys) throw new MailError(429, 'Usługa jest obciążona. Spróbuj później.');
   this.entries.set(key, { count: 1, until: now + period }); return;
  }
  if (current.count >= limit) throw new MailError(429, 'Zbyt wiele żądań. Spróbuj ponownie później.');
  current.count++;
 }
}
export class MailStore {
 constructor(db, domain, clock = Date.now) { this.db = db; this.domain = domain; this.clock = clock; }
 async purge() { await this.db.query('DELETE FROM mailboxes WHERE LEAST(expires_at,created_at+$2) <= $1', [this.clock(),HOUR]); }
 publicBox(row) { return {address: row.address, createdAt: Number(row.created_at), expiresAt: Math.min(Number(row.expires_at),Number(row.created_at)+HOUR), serverNow: this.clock(), maxExpiresAt: Number(row.created_at) + HOUR, deliveryReady: process.env.MAIL_INGRESS_READY === 'true' && !!process.env.MAILGUN_WEBHOOK_SIGNING_KEY}; }
 async create() {
  await this.purge();
  const token = randomBytes(32).toString('base64url'); const now = this.clock();
  const row = {id: randomUUID(), address: `${randomBytes(12).toString('hex')}@${this.domain}`, token_hash: digest(token), created_at: now, expires_at: now + HOUR};
  const r = await this.db.query('INSERT INTO mailboxes (id,address,token_hash,created_at,expires_at) SELECT $1,$2,$3,$4,$5 WHERE (SELECT count(*) FROM mailboxes) < 10000 RETURNING *',Object.values(row));
  if (!r.rows.length) throw new MailError(503,'Skrzynki są chwilowo niedostępne.');
  return {...this.publicBox(row), token};
 }
 async get(token) {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new MailError(401,'Brak skrzynki. Wygeneruj nowy adres.');
  await this.purge();
  const r = await this.db.query('SELECT * FROM mailboxes WHERE token_hash=$1 AND LEAST(expires_at,created_at+3600000)>$2',[digest(token),this.clock()]);
  if (!r.rows[0]) throw new MailError(410,'Skrzynka wygasła. Jej wiadomości zostały usunięte.');
  return r.rows[0];
 }
 async status(token) { const box=await this.get(token); return this.publicBox(box); }
 async extend(token) {
  await this.get(token);
  throw new MailError(409,'Maksymalna ważność skrzynki wynosi 60 minut.');
 }
 async remove(token) { await this.db.query('DELETE FROM mailboxes WHERE token_hash=$1',[digest(token || '')]); return {deleted:true}; }
 async list(token) {
  const box = await this.get(token);
  const r = await this.db.query('SELECT id,sender,subject,received_at,attachments FROM messages WHERE mailbox_id=$1 AND EXISTS(SELECT 1 FROM mailboxes WHERE id=$1 AND LEAST(expires_at,created_at+3600000)>$2) ORDER BY received_at DESC LIMIT 100',[box.id,this.clock()]);
  return {box:this.publicBox(box),messages:r.rows.map(row=>({...row,received_at:Number(row.received_at)}))};
 }
 async read(token,id) {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new MailError(404,'Nie znaleziono wiadomości.');
  const box=await this.get(token);
  const r=await this.db.query('SELECT m.* FROM messages m JOIN mailboxes b ON b.id=m.mailbox_id WHERE m.id=$1 AND b.id=$2 AND LEAST(b.expires_at,b.created_at+3600000)>$3',[id,box.id,this.clock()]);
  if (!r.rows[0]) throw new MailError(404,'Nie znaleziono wiadomości.');
  return {...r.rows[0],received_at:Number(r.rows[0].received_at)};
 }
 async recipient(address) {
  const r=await this.db.query('SELECT id FROM mailboxes WHERE address=$1 AND LEAST(expires_at,created_at+3600000)>$2',[address.toLowerCase(),this.clock()]);
  return !!r.rows.length;
 }
 async receive(address,mail,size,eventKey=null) {
  if (size>MAX_MESSAGE) throw new MailError(552,'Wiadomość przekracza limit 2 MB.');
  const attachments=(mail.attachments || []).map(a=>({filename:String(a.filename || 'załącznik').slice(0,200),size:a.size || a.content?.length || 0}));
  if (attachments.length>10 || attachments.some(a=>a.size>MAX_ATTACHMENT)) throw new MailError(552,'Załączniki przekraczają limit.');
  // Atomic quota + insert under a row lock (all SMTP writers must use this path).
  const db=await this.db.connect();
  try {
   await db.query('BEGIN');
   const b=await db.query('SELECT id FROM mailboxes WHERE address=$1 AND LEAST(expires_at,created_at+$3)>$2 FOR UPDATE',[address.toLowerCase(),this.clock(),HOUR]);
   if (!b.rows[0]) throw new MailError(550,'Nieznana lub wygasła skrzynka.');
   if(eventKey){
    const inserted=await db.query('INSERT INTO inbound_events(mailbox_id,event_key) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_key',[b.rows[0].id,eventKey]);
    if(!inserted.rows.length){await db.query('COMMIT');return {duplicate:true};}
   }
   const q=await db.query('SELECT count(*)::int AS count,COALESCE(sum(size),0)::bigint AS bytes FROM messages WHERE mailbox_id=$1',[b.rows[0].id]);
   if(q.rows[0].count>=100 || Number(q.rows[0].bytes)+size>10*MAX_MESSAGE) throw new MailError(452,'Skrzynka jest pełna.');
   const result=await db.query('INSERT INTO messages(id,mailbox_id,sender,subject,received_at,text_body,html_body,size,attachments) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb WHERE EXISTS(SELECT 1 FROM mailboxes WHERE id=$2 AND LEAST(expires_at,created_at+3600000)>$5) RETURNING id',[
    randomUUID(),b.rows[0].id,String(mail.from?.text || 'Nieznany nadawca').slice(0,500),String(mail.subject || '(bez tematu)').slice(0,500),this.clock(),String(mail.text || '').slice(0,MAX_MESSAGE),cleanHtml(mail.html),size,JSON.stringify(attachments)
   ]);
   if(!result.rows.length) throw new MailError(550,'Skrzynka wygasła.');
   await db.query('COMMIT'); return result.rows[0];
  } catch(e) { await db.query('ROLLBACK'); throw e; } finally { db.release(); }
 }
}
