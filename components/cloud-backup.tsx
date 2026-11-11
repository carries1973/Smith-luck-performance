"use client";
import {useEffect,useRef,useState} from "react";
import {emailAuth,validSession,readJournal,writeJournal,signOutLocal,resetPassword,type AuthSession} from "@/lib/supabase-journal";
type RecordWithId={id:string;completedAt?:string};
type Props<T extends RecordWithId,D>={hydrated:boolean;history:T[];drafts:Record<number,D>;onRestore:(history:T[],drafts:Record<number,D>)=>void};
export default function CloudBackup<T extends RecordWithId,D>({hydrated,history,drafts,onRestore}:Props<T,D>){
 const [session,setSession]=useState<AuthSession|null>(null);
 const [ready,setReady]=useState(false);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [mode,setMode]=useState<"login"|"signup">("login");
 const [status,setStatus]=useState("Sign in to enable cloud backup");
 const [busy,setBusy]=useState(false);
 const initialized=useRef<string|null>(null);
 const latest=useRef({history,drafts});
 const lastSaved=useRef("");
 latest.current={history,drafts};
 const restoreRef=useRef(onRestore);
 restoreRef.current=onRestore;
 useEffect(()=>{let active=true;void validSession().then(s=>{if(active)setSession(s)});return()=>{active=false}},[]);
 useEffect(()=>{
  if(!hydrated||!session||initialized.current===session.user.id)return;
  const ownerKey='smith-luck-cloud-owner-v1';
  const existingOwner=localStorage.getItem(ownerKey);
  if(existingOwner && existingOwner!==session.user.id){setStatus('This device has workout data linked to another account. Cloud sync blocked.');return;}
  initialized.current=session.user.id;setReady(false);
  let active=true;
  void(async()=>{
   try{
    const remote=await readJournal(session);
    if(!active)return;
    const merged=new Map<string,T>();
    for(const item of (remote?.history||[]) as T[])if(item?.id)merged.set(item.id,item);
    for(const item of latest.current.history)if(item?.id)merged.set(item.id,item);
    const combined=Array.from(merged.values()).sort((a,b)=>String(b.completedAt||"").localeCompare(String(a.completedAt||"")));
    const mergedDrafts={...(remote?.drafts||{}),...latest.current.drafts} as Record<number,D>;
    await writeJournal(session,{history:combined,drafts:mergedDrafts});
    if(!active)return;
    lastSaved.current=JSON.stringify({history:combined,drafts:mergedDrafts});
    localStorage.setItem(ownerKey,session.user.id);
    restoreRef.current(combined,mergedDrafts);setReady(true);setStatus("Cloud backup connected");
   }catch(e){if(active)setStatus("Cloud sync failed. Local data retained: "+String(e))}
  })();
  return()=>{active=false};
 },[hydrated,session]);
 useEffect(()=>{
  if(!ready||!session||!hydrated)return;
  const payload={history,drafts};const serialized=JSON.stringify(payload);
  if(serialized===lastSaved.current)return;
  setStatus("Saving to cloud…");
  const timer=setTimeout(()=>{void(async()=>{
   try{
    const current=await validSession();
    if(!current){setReady(false);setStatus("Sign in again to resume backup");return}
    await writeJournal(current,payload);
    lastSaved.current=serialized;setStatus("Cloud backup saved");
   }catch(e){setStatus("Cloud save failed; local copy retained: "+String(e))}
  })()},1500);
  return()=>clearTimeout(timer);
 },[history,drafts,ready,session,hydrated]);
 const submit=async()=>{
  setBusy(true);
  try{const result=await emailAuth(email,password,mode);setPassword("");
   if(result){initialized.current=null;setSession(result);setStatus("Importing local workout history…")}
   else setStatus("Confirm your email, then sign in.");
  }catch(e){setStatus(String(e))}finally{setBusy(false)}
 };
 return <section aria-label="Cloud backup" style={{padding:"12px 20px",borderBottom:"1px solid #35513b"}}>
 {session?<div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}><span>{session.user.email} · {status}</span><button onClick={()=>{signOutLocal();setSession(null);setReady(false);initialized.current=null;setStatus("Signed out. Local history retained.")}}>Sign out</button></div>:
 <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
 <strong>Secure cloud backup</strong>
 <input aria-label="Email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:8,color:"#111",background:"#fff",borderRadius:5}}/>
 <input aria-label="Password" type="password" autoComplete={mode==="signup"?"new-password":"current-password"} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:8,color:"#111",background:"#fff",borderRadius:5}}/>
 <button disabled={busy||!email||!password} onClick={()=>void submit()}>{mode==="login"?"Sign in":"Create account"}</button>
 <button onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"Create account instead":"Sign in instead"}</button>
 <button disabled={!email} onClick={()=>void resetPassword(email).then(()=>setStatus("If an account exists, a reset email will arrive.")).catch(e=>setStatus(String(e)))}>Reset password</button>
 <span role="status">{status}</span>
 </div>}
 </section>;
}
