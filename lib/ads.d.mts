export const AD_HOST:string;
export function verificationClient(host:string,env:NodeJS.ProcessEnv):string|null;
export type AdsConfig={client:string;top:string;bottom:string};
export function adsConfig(host:string,env:NodeJS.ProcessEnv):AdsConfig|null;
export function sellerText(env:NodeJS.ProcessEnv):string;
export function consentAllowed(data:unknown):boolean;
