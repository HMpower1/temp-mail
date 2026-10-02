import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { Limiter, MAX_MESSAGE } from './core.mjs';
export function createSmtp(store,logger=console) {
 const limits=new Limiter();
 const smtpError=(message,code=550)=>Object.assign(new Error(message),{responseCode:code});
 return new SMTPServer({
  name:`mx.${store.domain}`,banner:'Temp Mail receive-only',authOptional:true,
  disabledCommands:['AUTH','STARTTLS'],size:MAX_MESSAGE,maxClients:50,socketTimeout:30000,
  hidePIPELINING:true,hideVRFY:true,hideEXPN:true,
  onConnect(session,cb){try{limits.take(`connect:${session.remoteAddress}`,60,60000);cb();}catch{cb(smtpError('Too many connections',421));}},
  onMailFrom(address,session,cb){try{limits.take(`mail:${session.remoteAddress}`,120,60000);cb();}catch{cb(smtpError('Too many messages',451));}},
  onRcptTo(address,session,cb){
   if(session.envelope.rcptTo.length>=1) return cb(smtpError('One recipient per message',452));
   const target=address.address.toLowerCase();
   if(!target.endsWith(`@${store.domain}`)) return cb(smtpError('Relaying denied'));
   store.recipient(target).then(ok=>cb(ok?undefined:smtpError('Unknown or expired mailbox'))).catch(()=>cb(smtpError('Service unavailable',451)));
  },
  onData(stream,session,cb){
   let size=0,tooLarge=false;const chunks=[];
   stream.on('data',chunk=>{size+=chunk.length;if(size>MAX_MESSAGE){tooLarge=true;chunks.length=0;}else if(!tooLarge)chunks.push(chunk);});
   stream.on('error',()=>cb(smtpError('Message stream failed',451)));
   stream.on('end',async()=>{
    if(tooLarge || stream.sizeExceeded) return cb(smtpError('Message exceeds 2 MB',552));
    try{
     const mail=await simpleParser(Buffer.concat(chunks),{skipHtmlToText:true,skipTextToHtml:true,skipImageLinks:true,maxHtmlLengthToParse:MAX_MESSAGE});
     await store.receive(session.envelope.rcptTo[0].address,mail,size);cb();
    }catch(e){if(!e.status)logger.error({code:e.code || 'smtp'},'Błąd odbioru poczty');cb(smtpError(e.status?'Message rejected':'Service unavailable',e.status || 451));}
   });
  }
 });
}
