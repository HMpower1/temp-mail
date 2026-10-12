export const AD_HOST='temp-mail.serwerbb.win';
export function verificationClient(host,env){const client=env.NEXT_PUBLIC_ADSENSE_CLIENT;return host===AD_HOST&&/^ca-pub-\d{16}$/.test(client||'')?client:null;}
export function adsConfig(host,env){
 if(host!==AD_HOST||env.ADSENSE_ENABLED!=='true'||env.ADSENSE_SITE_STATUS!=='Ready'||env.ADSENSE_CMP_PUBLISHED!=='true')return null;
 const client=env.NEXT_PUBLIC_ADSENSE_CLIENT,top=env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,bottom=env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM;
 if(!/^ca-pub-\d{16}$/.test(client||'')||!/^\d{10}$/.test(top||'')||!/^\d{10}$/.test(bottom||''))return null;
 return {client,top,bottom};
}
export function sellerText(env){const client=env.NEXT_PUBLIC_ADSENSE_CLIENT;return /^ca-pub-\d{16}$/.test(client||'')?`google.com, ${client.slice(3)}, DIRECT, f08c47fec0942fa0\nsubdomain=${AD_HOST}\n`:'# AdSense nie jest skonfigurowany.\n';}
export function consentAllowed(data){return data?.cmpStatus==='loaded'&&['tcloaded','useractioncomplete'].includes(data.eventStatus)&&data.gdprApplies===true&&data.purpose?.consents?.[1]===true&&data.purpose?.consents?.[3]===true&&data.purpose?.consents?.[4]===true&&data.vendor?.consents?.[755]===true;}
