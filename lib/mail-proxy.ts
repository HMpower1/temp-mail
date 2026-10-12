type MailEnv = {MAIL_API_ORIGIN?:string;MAIL_API_KEY?:string};
const cookieName='__Host-temp-mail';
const json=(body:unknown,status:number)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function mailProxy(request:Request,env:MailEnv,internal=false){
 const path=new URL(request.url).pathname.replace(/^\/api/,'');
 if(!/^\/(mailbox(?:\/extend)?|messages(?:\/[0-9a-f-]{36})?)$/.test(path))return json({error:'Nie znaleziono.'},404);
 if(!['GET','POST','DELETE'].includes(request.method))return json({error:'Niedozwolona metoda.'},405);
 if(request.method!=='GET' && request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Niedozwolone źródło żądania.'},403);
 if(!env.MAIL_API_ORIGIN || !env.MAIL_API_KEY)return json({error:'Odbiór poczty nie został jeszcze uruchomiony. Spróbuj ponownie później.'},503);
 let origin:URL;try{origin=new URL(env.MAIL_API_ORIGIN);}catch{return json({error:'Usługa niedostępna.'},503);}
 if(origin.protocol!=='https:' && !(internal && origin.origin==='http://receiver:8080'))return json({error:'Usługa niedostępna.'},503);
 const token=request.headers.get('Cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(`${cookieName}=`))?.slice(cookieName.length+1) || '';
 try{
  const response=await fetch(new URL(path,origin.origin),{method:request.method,redirect:'error',signal:AbortSignal.timeout(10000),headers:{'X-API-Key':env.MAIL_API_KEY,'X-Mailbox-Token':token,'X-Client-IP':(internal?request.headers.get('X-Real-IP'):request.headers.get('CF-Connecting-IP')) || 'unknown'}});
  const data=await response.json() as Record<string,unknown>;
  const issued=data.token;delete data.token;
  const result=json(data,response.status);
  if(response.ok && typeof issued==='string')result.headers.set('Set-Cookie',`${cookieName}=${issued}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`);
  if(response.status===410 || (request.method==='DELETE' && response.ok))result.headers.set('Set-Cookie',`${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
  return result;
 }catch{console.error(JSON.stringify({event:'mail_api_unavailable'}));return json({error:'Nie można połączyć się ze skrzynką. Spróbuj ponownie.'},503);}
}
