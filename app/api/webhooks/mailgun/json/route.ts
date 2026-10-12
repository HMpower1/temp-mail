export const runtime='nodejs';
export async function POST(request:Request){
 if(!process.env.MAIL_API_ORIGIN)return Response.json({error:'Odbiór nie został skonfigurowany.'},{status:503});
 const max=4*1024*1024;
 const reader=request.body?.getReader();if(!reader)return new Response(null,{status:400});
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();return new Response(null,{status:413});}chunks.push(value);}
 try{
  const response=await fetch(new URL('/webhooks/mailgun/json',process.env.MAIL_API_ORIGIN),{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json','X-Mailgun-Timestamp':request.headers.get('X-Mailgun-Timestamp')||'','X-Mailgun-Signature':request.headers.get('X-Mailgun-Signature')||''},body:Buffer.concat(chunks)});
  return new Response(await response.text(),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 }catch{console.error(JSON.stringify({event:'mailgun_upstream_unavailable'}));return new Response(null,{status:503});}
}
