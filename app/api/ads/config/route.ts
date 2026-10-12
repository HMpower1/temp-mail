import {adsConfig} from '@/lib/ads.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return Response.json(adsConfig(request.headers.get('host')||'',process.env),{headers:{'Cache-Control':'no-store'}});}
