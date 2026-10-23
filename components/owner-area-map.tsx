"use client";
import {useEffect,useRef,useState} from "react";
import Image from "next/image";
import {MapPin} from "lucide-react";
import type {Lang} from "@/lib/region";
import type {PublicOwnerArea} from "@/lib/public-owner-area";
import {ownerAreaMapLayout} from "@/lib/owner-area-map";

export const ownerAreaCopy={
  da:{title:"Udlejerens område",note:"Ringen markerer et omtrentligt område omkring postbyen – ikke udlejerens adresse.",missing:"Bykortet er ikke tilgængeligt.",error:"Kortbillederne kunne ikke indlæses."},
  sv:{title:"Uthyrarens område",note:"Ringen visar ett ungefärligt område runt postorten – inte uthyrarens adress.",missing:"Ortskartan är inte tillgänglig.",error:"Kartbilderna kunde inte laddas."},
  nb:{title:"Utleierens område",note:"Ringen viser et omtrentlig område rundt poststedet – ikke utleierens adresse.",missing:"Stedskartet er ikke tilgjengelig.",error:"Kartbildene kunne ikke lastes inn."},
};

export function OwnerAreaMap({area,lang}:{area:PublicOwnerArea|null;lang:Lang}) {
  const c=ownerAreaCopy[lang],ref=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(0),[failed,setFailed]=useState(false);
  useEffect(()=>{
    if(!ref.current)return;
    const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));
    observer.observe(ref.current);return()=>observer.disconnect();
  },[area]);
  const {tiles,radius}=area?ownerAreaMapLayout(area,width,230):{tiles:[],radius:0};
  return <figure className="owner-area-map">
    <figcaption><MapPin size={17}/><strong>{c.title}</strong>{area&&<span>{area.postcode} {area.city}</span>}</figcaption>
    {area?<><div className="owner-area-map-viewport" ref={ref} role="img" aria-label={`${c.title}: ${area.postcode} ${area.city}. ${c.note}`}>
      {tiles.map(tile=><Image unoptimized key={tile.key} src={tile.url} width={256} height={256} alt="" draggable={false} onError={()=>setFailed(true)} className="owner-area-map-tile" style={{left:tile.left,top:tile.top}}/>)}
      {radius>0&&<span className="owner-area-map-ring" aria-hidden="true" style={{width:radius*2,height:radius*2}}/>}
    </div><a className="owner-area-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>
    {failed&&<p className="owner-area-map-error" role="status">{c.error}</p>}<p>{c.note}</p></>:<p>{c.missing}</p>}
  </figure>;
}
