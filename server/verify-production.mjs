import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
const origin='https://temp-mail.serwerbb.win';
const r=await fetch(`${origin}/api/mailbox`,{method:'POST',headers:{Origin:origin}});
assert.equal(r.status,200);const box=await r.json();const cookie=r.headers.get('set-cookie').split(';')[0];
const transport=nodemailer.createTransport({host:'127.0.0.1',port:25,secure:false,ignoreTLS:true});
try{
 await transport.sendMail({from:'test@example.com',to:box.address,subject:'Production integration test',text:'SMTP delivery OK',html:'<p>SMTP delivery OK</p><script>alert(1)</script><img src="https://example.com/tracker">'});
 const inbox=await fetch(`${origin}/api/messages`,{headers:{Cookie:cookie}});assert.equal(inbox.status,200);const list=await inbox.json();assert.equal(list.messages.length,1);
 const message=await fetch(`${origin}/api/messages/${list.messages[0].id}`,{headers:{Cookie:cookie}});const detail=await message.json();assert.equal(detail.text_body,'SMTP delivery OK');assert.equal(detail.html_body,'<p>SMTP delivery OK</p>');
 assert.equal((await fetch(`${origin}/api/mailbox`,{method:'DELETE',headers:{Origin:origin,Cookie:cookie}})).status,200);
 assert.equal((await fetch(`${origin}/api/messages`,{headers:{Cookie:cookie}})).status,410);
 console.log('PASS: public API -> local SMTP -> PostgreSQL -> public inbox -> sanitized HTML -> cascade deletion.');
 console.log('Internet TCP/25 reachability requires a separate external test.');
}finally{transport.close();}
