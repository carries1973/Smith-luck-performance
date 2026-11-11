/* Public publishable key only; NEVER place secret/service-role keys in browser code. */
export const SUPABASE_URL = "https://pimpxtvjiupdcodkjjoi.supabase.co";
const PUBLIC_KEY = "sb_publishable_yrmsIUxtc6kG4xQ5ffZBVw_bngzhAYs";
const SESSION_KEY = "smith-luck-supabase-session-v1";
export type AuthSession = {access_token:string;refresh_token:string;expires_at:number;user:{id:string;email?:string}};
export function getSession():AuthSession|null {
 try { const v=localStorage.getItem(SESSION_KEY);return v?JSON.parse(v) as AuthSession:null; } catch{return null;}
}
export function saveSession(data:Record<string,unknown>):AuthSession {
 const user=data.user as {id:string;email?:string};
 const session:AuthSession={access_token:String(data.access_token),refresh_token:String(data.refresh_token),expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600),user};
 localStorage.setItem(SESSION_KEY,JSON.stringify(session));return session;
}
export function signOutLocal(){localStorage.removeItem(SESSION_KEY);}
async function request(path:string,init:RequestInit={},token?:string){
 const response=await fetch(SUPABASE_URL+path,{...init,headers:{"apikey":PUBLIC_KEY,"Content-Type":"application/json",...(token?{"Authorization":"Bearer "+token}:{}),...init.headers}});
 const body=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(String(body.msg||body.error_description||body.message||body.error||"Supabase request failed"));
 return body;
}
export async function emailAuth(email:string,password:string,mode:"login"|"signup"){
 const body=await request(mode==="login"?"/auth/v1/token?grant_type=password":"/auth/v1/signup",{method:"POST",body:JSON.stringify({email,password})});
 return body.access_token?saveSession(body):null;
}
export async function resetPassword(email:string){
 await request("/auth/v1/recover",{method:"POST",body:JSON.stringify({email})});
}
export async function validSession():Promise<AuthSession|null>{
 const session=getSession();if(!session)return null;
 if(session.expires_at>Date.now()/1000+90)return session;
 try{return saveSession(await request("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:session.refresh_token})}));}
 catch{signOutLocal();return null;}
}
export type CloudJournal={history:unknown[];drafts:Record<string,unknown>};
export async function readJournal(session:AuthSession):Promise<CloudJournal|null>{
 const data=await request("/rest/v1/fitness_journal_sync?select=history,drafts&user_id=eq."+encodeURIComponent(session.user.id),{headers:{"Accept":"application/json"}},session.access_token);
 return Array.isArray(data)&&data.length?data[0] as CloudJournal:null;
}
export async function writeJournal(session:AuthSession,journal:CloudJournal){
 await request("/rest/v1/fitness_journal_sync?on_conflict=user_id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({user_id:session.user.id,...journal,updated_at:new Date().toISOString()})},session.access_token);
}
