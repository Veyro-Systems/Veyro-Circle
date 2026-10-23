"use client";
import {useEffect,useId,useState} from "react";
import type {User} from "firebase/auth";
import {Copy,Share2,UsersRound,LoaderCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {invitationLink,shareInvitation} from "@/lib/invitation-client";
import type {Lang} from "@/lib/region";

type Stats={code:string;registrations:number;sharedAtLeastOnce:number;admin:boolean};
type Totals=Pick<Stats,"registrations"|"sharedAtLeastOnce">;
export const invitationWords={
 da:{title:"Invitér en nabo",intro:"Hjælp dit lokalområde med at dele mere og købe mindre. Invitér 3 naboer til Veyro Circle.",copy:"Kopiér link",share:"Del invitation",done:"Linket er kopieret",link:"Dit invitationslink",joined:"Naboer tilmeldt via dig",shared:"Har oprettet mindst én annonce",owner:"Invitationer i hele Circle",allJoined:"Tilmeldt via invitationer",allShared:"Har oprettet en annonce",error:"Invitationen kunne ikke hentes. Prøv igen.",adminError:"Den samlede oversigt kunne ikke hentes.",copyError:"Linket kunne ikke kopieres automatisk. Du kan markere og kopiere det i feltet.",loading:"Henter din invitation…",retry:"Prøv igen",privacy:"Kun nye brugere, der vælger invitationen, tæller med. Du ser samlede antal, ikke navne eller kontaktoplysninger.",message:"Del mere og køb mindre sammen med mig på Veyro Circle."},
 sv:{title:"Bjud in en granne",intro:"Hjälp ditt närområde att dela mer och köpa mindre. Bjud in 3 grannar till Veyro Circle.",copy:"Kopiera länk",share:"Dela inbjudan",done:"Länken har kopierats",link:"Din inbjudningslänk",joined:"Grannar som registrerat sig via dig",shared:"Har lagt upp minst en annons",owner:"Inbjudningar i hela Circle",allJoined:"Registrerade via inbjudningar",allShared:"Har lagt upp en annons",error:"Inbjudan kunde inte hämtas. Försök igen.",adminError:"Den samlade översikten kunde inte hämtas.",copyError:"Länken kunde inte kopieras automatiskt. Du kan markera och kopiera den i fältet.",loading:"Hämtar din inbjudan…",retry:"Försök igen",privacy:"Bara nya användare som väljer inbjudan räknas. Du ser sammanlagda antal, inte namn eller kontaktuppgifter.",message:"Dela mer och köp mindre med mig på Veyro Circle."},
 nb:{title:"Inviter en nabo",intro:"Hjelp nærområdet ditt med å dele mer og kjøpe mindre. Inviter 3 naboer til Veyro Circle.",copy:"Kopier lenke",share:"Del invitasjon",done:"Lenken er kopiert",link:"Din invitasjonslenke",joined:"Naboer registrert via deg",shared:"Har lagt ut minst én annonse",owner:"Invitasjoner i hele Circle",allJoined:"Registrert via invitasjoner",allShared:"Har lagt ut en annonse",error:"Invitasjonen kunne ikke hentes. Prøv igjen.",adminError:"Den samlede oversikten kunne ikke hentes.",copyError:"Lenken kunne ikke kopieres automatisk. Du kan markere og kopiere den i feltet.",loading:"Henter invitasjonen din…",retry:"Prøv igjen",privacy:"Bare nye brukere som velger invitasjonen, teller med. Du ser samlede antall, ikke navn eller kontaktopplysninger.",message:"Del mer og kjøp mindre sammen med meg på Veyro Circle."},
};
async function fetchStats<T>(path:string,user:User):Promise<T>{
 const response=await fetch(path,{headers:{authorization:`Bearer ${await user.getIdToken()}`},cache:"no-store"});
 if(!response.ok)throw Error("INVITATIONS_UNAVAILABLE");return response.json() as Promise<T>;
}
export function CircleInvitePanel({lang,user}:{lang:Lang;user:User}) {
 const w=invitationWords[lang],linkId=useId();
 const [stats,setStats]=useState<Stats|null>(null),[totals,setTotals]=useState<Totals|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState(false),[revision,setRevision]=useState(0);
 const [feedback,setFeedback]=useState<"copied"|"error"|null>(null);
 useEffect(()=>{
  let active=true;
  fetchStats<Stats>("/api/invitations",user).then(async current=>{
   if(!active)return;setStats(current);setError(false);
   if(current.admin)try{const all=await fetchStats<Totals>("/api/invitations/admin",user);if(active)setTotals(all);}catch{if(active)setTotals(null);}
  }).catch(()=>{if(active)setError(true);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[user,revision]);
 const link=stats&&typeof window!=="undefined"?invitationLink(stats.code,lang,window.location.origin):"";
 function retry(){setError(false);setLoading(true);setTotals(null);setRevision(value=>value+1);}
 async function copy(){try{await navigator.clipboard.writeText(link);setFeedback("copied");}catch{setFeedback("error");}}
 async function share(){try{const result=await shareInvitation({title:"Veyro Circle",text:w.message,url:link},navigator);setFeedback(result==="copied"?"copied":null);}catch{setFeedback("error");}}
 return <section className="circle-invite-panel panel" aria-label={w.title}>
  <header><span aria-hidden="true"><UsersRound size={24}/></span><h2>{w.title}</h2></header><p>{w.intro}</p>
  {loading&&<p role="status" className="invite-loading"><LoaderCircle className="animate-spin" size={17}/>{w.loading}</p>}
  {error&&<div role="alert"><p>{w.error}</p><Button type="button" variant="outline" onClick={retry}>{w.retry}</Button></div>}
  {stats&&!loading&&!error&&<>
   <dl className="invite-metrics"><div><dt>{w.joined}</dt><dd>{stats.registrations}</dd></div><div><dt>{w.shared}</dt><dd>{stats.sharedAtLeastOnce}</dd></div></dl>
   <label className="invite-link" htmlFor={linkId}>{w.link}<input id={linkId} readOnly value={link} onFocus={event=>event.currentTarget.select()}/></label>
   <div className="invite-actions"><Button type="button" variant="outline" onClick={()=>void copy()}><Copy size={17}/>{w.copy}</Button><Button type="button" onClick={()=>void share()}><Share2 size={17}/>{w.share}</Button></div>
   {feedback&&<p role={feedback==="error"?"alert":"status"}>{feedback==="copied"?w.done:w.copyError}</p>}<p className="invite-privacy">{w.privacy}</p>
   {stats.admin&&<section className="invite-owner-totals" aria-label={w.owner}><h3>{w.owner}</h3>{totals?<dl className="invite-metrics"><div><dt>{w.allJoined}</dt><dd>{totals.registrations}</dd></div><div><dt>{w.allShared}</dt><dd>{totals.sharedAtLeastOnce}</dd></div></dl>:<><p role="status">{w.adminError}</p><Button type="button" variant="outline" onClick={retry}>{w.retry}</Button></>}</section>}
  </>}
 </section>;
}
