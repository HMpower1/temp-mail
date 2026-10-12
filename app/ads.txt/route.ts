import {sellerText} from '@/lib/ads.mjs';
export const dynamic='force-dynamic';
export function GET(){return new Response(sellerText(process.env),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});}
