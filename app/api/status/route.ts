import {adsConfig} from '@/lib/ads.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const r=await fetch(new URL('/status',process.env.MAIL_API_ORIGIN),{cache:'no-store',signal:AbortSignal.timeout(5000)});const data=await r.json() as Record<string,unknown>;data.ads={enabled:!!adsConfig(request.headers.get('host')||'',process.env)};return Response.json(data,{status:r.status,headers:{'Cache-Control':'no-store'}});}catch{return Response.json({status:'unavailable'},{status:503});}}
