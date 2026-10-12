"use client";
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {AD_HOST,consentAllowed,type AdsConfig} from '@/lib/ads.mjs';
type AdWindow=Window&{dataLayer?:unknown[];adsbygoogle?:unknown[];googlefc?:{callbackQueue:unknown[];showRevocationMessage?:()=>void};__tcfapi?:(command:string,version:number,callback:(data:unknown,success:boolean)=>void)=>void};
const Context=createContext<AdsConfig|null>(null);
export function AdProvider({children}:{children:React.ReactNode}){
 const [config,setConfig]=useState<AdsConfig|null>(null),[allowed,setAllowed]=useState(false);const granted=useRef(false);
 useEffect(()=>{
  if(location.host!==AD_HOST||location.protocol!=='https:')return;
  let disposed=false;const w=window as AdWindow;
  const mode=(value:'granted'|'denied',command='update')=>{w.dataLayer??=[];function gtag(...args:unknown[]){w.dataLayer!.push(Object.assign({length:args.length},args));}gtag('consent',command,{ad_storage:value,ad_user_data:value,ad_personalization:value,analytics_storage:'denied'});};
  mode('denied','default');
  void fetch('/api/ads/config',{cache:'no-store'}).then(r=>r.json() as Promise<AdsConfig|null>).then((c:AdsConfig|null)=>{
   if(disposed||!c)return;setConfig(c);w.googlefc??={callbackQueue:[]};
   w.googlefc.callbackQueue.push({CONSENT_API_READY:()=>w.__tcfapi?.('addEventListener',2,(data,success)=>{
    if(disposed)return;const yes=success&&consentAllowed(data);setAllowed(yes);
    if(!yes&&granted.current){mode('denied');location.reload();return;}
    if(yes&&!granted.current){granted.current=true;mode('granted');const ad=document.createElement('script');ad.id='temp-mail-ads';ad.async=true;ad.crossOrigin='anonymous';ad.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${c.client}`;document.head.appendChild(ad);}
   })});
   const cmp=document.createElement('script');cmp.id='temp-mail-cmp';cmp.async=true;cmp.src=`https://fundingchoicesmessages.google.com/i/${c.client}?ers=1`;document.head.appendChild(cmp);
  }).catch(()=>{});
  return()=>{disposed=true;document.getElementById('temp-mail-cmp')?.remove();document.getElementById('temp-mail-ads')?.remove();};
 },[]);
 return <Context.Provider value={allowed?config:null}>{children}{config&&<button className="quiet consent-settings" onClick={()=>(window as AdWindow).googlefc?.showRevocationMessage?.()}>Ustawienia prywatności i cookies</button>}</Context.Provider>;
}
export function AdSlot({position}:{position:'top'|'bottom'}){
 const config=useContext(Context),element=useRef<HTMLModElement>(null),initialized=useRef(false);
 useEffect(()=>{if(!config||!element.current||initialized.current)return;initialized.current=true;const w=window as AdWindow;w.adsbygoogle??=[];w.adsbygoogle.push({});},[config]);
 if(!config)return null;
 return <aside className="ad-slot" aria-label="Reklama"><span>Reklama</span><ins ref={element} className="adsbygoogle" style={{display:'block'}} data-ad-client={config.client} data-ad-slot={config[position]} data-ad-format="auto" data-full-width-responsive="true"/></aside>;
}
