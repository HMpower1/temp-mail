import Fastify from 'fastify';
import { createHmac } from 'node:crypto';
import { Limiter, sameSecret, MailError } from './core.mjs';
import {verifyMailgun,parseMailgun,MAX_WEBHOOK} from './mailgun.mjs';
export function createApi(store,key,options={}) {
 const signingKey=options.signingKey ?? process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
 const app=Fastify({logger:{level:'warn',redact:['req.headers','res.headers']},bodyLimit:1024,trustProxy:false});
 app.removeContentTypeParser('application/json');
 app.addContentTypeParser('application/json',{parseAs:'buffer'},(_req,body,done)=>done(null,body));
 const limits=new Limiter();
 app.addHook('onRequest',async(req,reply)=>{
  reply.header('Cache-Control','no-store').header('X-Content-Type-Options','nosniff');
  if(req.url==='/health' || req.url==='/status') return;
  if(req.url==='/webhooks/mailgun/json') { limits.take(`webhook:${req.ip}`,240,60000); return; }
  if(!sameSecret(req.headers['x-api-key'],key)) throw new MailError(401,'Brak dostępu.');
  const ip=String(req.headers['x-client-ip'] || req.ip);
  const hash=createHmac('sha256',key).update(`${new Date().toISOString().slice(0,10)}:${ip}`).digest('hex');
  req.rateKey=hash;
  limits.take(`all:${hash}`,180,60000);
 });
 app.setErrorHandler((err,req,reply)=>{
  if(!err.status && !err.statusCode) app.log.error({code:err.code || 'internal'},'Błąd obsługi żądania');
  const status=err.status || err.statusCode || 503;
  reply.code(status).send({error:status>=500?'Usługa jest chwilowo niedostępna.':err.message});
 });
 app.get('/health',async()=>{await store.db.query('SELECT 1');return {status:'ok'};});
 app.get('/status',async()=>{await store.db.query('SELECT 1');return {status:'ok',mail:{provider:'mailgun-eu',domain:store.domain,configured:!!signingKey,ready:!!signingKey && process.env.MAIL_INGRESS_READY==='true',retentionMinutes:60},ads:{enabled:false}};});
 app.post('/webhooks/mailgun/json',{bodyLimit:MAX_WEBHOOK},async(req,reply)=>{
  if(!signingKey)return reply.code(503).send({error:'Odbiór poczty czeka na konfigurację providera.'});
  if(!Buffer.isBuffer(req.body)||!verifyMailgun(req.body,req.headers,signingKey)) {
   app.log.warn({event:'mailgun_signature_rejected'},'Odrzucono webhook');
   return reply.code(401).send({error:'Niepoprawny podpis.'});
  }
  let event;
  try { event=parseMailgun(req.body,store.domain); } catch(e) { return reply.code(406).send({error:e.message}); }
  try {
   const result=await store.receive(event.recipient,event.mail,event.size,event.eventKey);
   app.log.warn({event:result.duplicate?'mailgun_duplicate':'mailgun_received'},'Obsłużono webhook');
   return {accepted:true,duplicate:!!result.duplicate};
  } catch(e) {
   if([550,552,452].includes(e.status))return reply.code(406).send({error:'Nieaktywna skrzynka lub przekroczony limit.'});
   throw e;
  }
 });
 app.post('/mailbox',async req=>{limits.take(`new:${req.rateKey}`,10,3600000);return store.create();});
 app.get('/mailbox',async req=>store.status(req.headers['x-mailbox-token']));
 app.delete('/mailbox',async req=>store.remove(req.headers['x-mailbox-token']));
 app.post('/mailbox/extend',async req=>{limits.take(`extend:${req.rateKey}`,30,3600000);return store.extend(req.headers['x-mailbox-token']);});
 app.get('/messages',async req=>store.list(req.headers['x-mailbox-token']));
 app.get('/messages/:id',async req=>store.read(req.headers['x-mailbox-token'],req.params.id));
 return app;
}
