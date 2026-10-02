import Fastify from 'fastify';
import { createHmac } from 'node:crypto';
import { Limiter, sameSecret, MailError } from './core.mjs';
export function createApi(store,key) {
 const app=Fastify({logger:{level:'warn',redact:['req.headers','res.headers']},bodyLimit:1024,trustProxy:false});
 const limits=new Limiter();
 app.addHook('onRequest',async(req,reply)=>{
  reply.header('Cache-Control','no-store').header('X-Content-Type-Options','nosniff');
  if(req.url==='/health') return;
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
 app.post('/mailbox',async req=>{limits.take(`new:${req.rateKey}`,10,3600000);return store.create();});
 app.get('/mailbox',async req=>store.status(req.headers['x-mailbox-token']));
 app.delete('/mailbox',async req=>store.remove(req.headers['x-mailbox-token']));
 app.post('/mailbox/extend',async req=>{limits.take(`extend:${req.rateKey}`,30,3600000);return store.extend(req.headers['x-mailbox-token']);});
 app.get('/messages',async req=>store.list(req.headers['x-mailbox-token']));
 app.get('/messages/:id',async req=>store.read(req.headers['x-mailbox-token'],req.params.id));
 return app;
}
