import {mailProxy} from '@/lib/mail-proxy';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const siteOrigin=process.env.SITE_ORIGIN;
 if(!siteOrigin)return Response.json({error:'Usługa niedostępna.'},{status:503});
 const canonical=new Request(new URL(new URL(request.url).pathname,siteOrigin),{method:request.method,headers:request.headers});
 return mailProxy(canonical,{MAIL_API_ORIGIN:process.env.MAIL_API_ORIGIN,MAIL_API_KEY:process.env.MAIL_API_KEY},true);
}
export const POST=GET;
export const DELETE=GET;
