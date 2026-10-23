"use client";
import {useEffect,useState} from "react";
import Image from "next/image";
import {CircleUserRound,MapPin,PackageOpen} from "lucide-react";
import type {Lang} from "@/lib/region";
import {money} from "@/lib/marketplace";
import type {CircleListingRecord} from "@/lib/firebase-listings";
import {ListingReviews} from "./circle-reviews";

export const ownerProfileCopy={
 da:{title:"Udlejerprofil",description:"Anmeldelser og ting fra samme udlejer.",open:"Se udlejerens profil og ting",own:"Se min offentlige profil",items:"Ting fra denne udlejer",empty:"Ingen aktive ting at vise lige nu.",loading:"Henter udlejerprofil…",error:"Profilen kunne ikke hentes.",retry:"Prøv igen",free:"Gratis udlån",day:"pr. dag",notice:"Anmeldelser kan gives efter et gennemført lån eller lejemål. Privat adresse og kontaktoplysninger vises først i en godkendt aftale."},
 sv:{title:"Uthyrarprofil",description:"Omdömen och saker från samma uthyrare.",open:"Se uthyrarens profil och saker",own:"Se min offentliga profil",items:"Saker från den här uthyraren",empty:"Inga aktiva saker att visa just nu.",loading:"Hämtar uthyrarprofil…",error:"Profilen kunde inte hämtas.",retry:"Försök igen",free:"Gratis utlåning",day:"per dag",notice:"Omdömen kan lämnas efter ett avslutat lån eller hyrestillfälle. Privat adress och kontaktuppgifter visas först i ett godkänt avtal."},
 nb:{title:"Utleierprofil",description:"Vurderinger og ting fra samme utleier.",open:"Se utleierens profil og ting",own:"Se min offentlige profil",items:"Ting fra denne utleieren",empty:"Ingen aktive ting å vise akkurat nå.",loading:"Henter utleierprofil…",error:"Profilen kunne ikke hentes.",retry:"Prøv igjen",free:"Gratis utlån",day:"per dag",notice:"Vurderinger kan gis etter et gjennomført lån eller leieforhold. Privat adresse og kontaktopplysninger vises først i en godkjent avtale."},
};
type PublicOwner={uid:string;name:string;city:string;country:"DK"|"SE"|"NO"};
type Data={owner:PublicOwner;listings:CircleListingRecord[]};
export function OwnerProfileContent({data,lang,onListing}:{data:Data;lang:Lang;onListing:(listing:CircleListingRecord)=>void}) {
 const c=ownerProfileCopy[lang];
 return <div className="owner-profile-body"><header className="owner-profile-identity"><span className="owner-profile-avatar" aria-hidden="true"><CircleUserRound size={35}/></span><div><h3>{data.owner.name}</h3><p><MapPin size={16}/>{data.owner.city} · {data.owner.country}</p></div></header>
  <ListingReviews ownerUid={data.owner.uid} lang={lang}/>
  <section aria-labelledby="owner-profile-items"><h3 id="owner-profile-items">{c.items} <span>({data.listings.length})</span></h3>{data.listings.length?<div className="owner-profile-grid">{data.listings.map(item=><button key={item.id} className="owner-profile-item" type="button" onClick={()=>onListing(item)}>{item.photos?.[0]?.src?<Image unoptimized src={item.photos[0].src} width={320} height={210} alt={item.name}/>:<span className="owner-profile-placeholder"><PackageOpen size={36}/></span>}<span className="owner-profile-item-copy"><b>{item.name}</b><span>{item.dailyPrice>0?`${money(item.dailyPrice,item.country,lang)} ${c.day}`:c.free}</span><small>{item.city}</small></span></button>)}</div>:<p>{c.empty}</p>}</section><p className="owner-profile-notice">{c.notice}</p>
 </div>;
}
export function CircleOwnerProfile({uid,lang,onListing}:{uid:string;lang:Lang;onListing:(listing:CircleListingRecord)=>void}) {
 const c=ownerProfileCopy[lang];
 const [data,setData]=useState<Data|null>(null),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;fetch(`/api/owner-profile?ownerUid=${encodeURIComponent(uid)}`,{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error();return r.json();}).then(value=>{if(active){setData(value);setFailed(false);}}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};},[uid,attempt]);
 if(failed)return <div role="alert"><p>{c.error}</p><button type="button" className="text-link" onClick={()=>{setFailed(false);setAttempt(n=>n+1);}}>{c.retry}</button></div>;
 return data?<OwnerProfileContent data={data} lang={lang} onListing={onListing}/>:<p role="status">{c.loading}</p>;
}
