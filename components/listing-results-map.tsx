"use client";
import {useEffect,useId,useMemo,useRef,useState,type PointerEvent,type KeyboardEvent} from "react";
import Image from "next/image";
import {MapPin,Minus,Plus,Scan,X,PackageOpen} from "lucide-react";
import {money,type Country,type Lang} from "@/lib/marketplace";
import {publicOwnerArea} from "@/lib/public-owner-area";
import {clusterListingMap,fitListingMap,listingMapTiles,projectMapPoint,unprojectMapPoint,type ListingMapView} from "@/lib/listing-map";
import {bindMapWheel} from "@/lib/map-wheel";

export type MapListing={id:string;name:string;owner:string;city:string;country:Country;place:unknown;dailyPrice:number;photos?:Array<{src:string}>};
export const resultsMapCopy={
 da:{title:"Søgeresultater på kort",preview:"Valgte annoncer",open:"Åbn annonce",close:"Luk forhåndsvisning",zoomIn:"Zoom ind",zoomOut:"Zoom ud",fit:"Vis alle resultater",free:"Gratis",items:"ting",from:"Fra",day:"pr. dag",missing:"Nogle annoncer mangler et gyldigt postområde og vises kun i liste- og kanbanvisning.",privacy:"Markeringerne viser postområdernes omtrentlige centrum, ikke private adresser.",help:"Klik på en markering for at se annoncen øverst til højre. Klik på annoncen for at åbne den. Træk kortet, eller brug piletasterne og +/−.",wheel:"Klik i kortet for at zoome med musehjulet. Tryk Escape for at rulle siden igen.",error:"Kortbillederne kunne ikke indlæses. Du kan stadig vælge annoncerne eller bruge listevisning."},
 sv:{title:"Sökresultat på karta",preview:"Valda annonser",open:"Öppna annons",close:"Stäng förhandsvisning",zoomIn:"Zooma in",zoomOut:"Zooma ut",fit:"Visa alla resultat",free:"Gratis",items:"saker",from:"Från",day:"per dag",missing:"Vissa annonser saknar giltigt postområde och visas endast i list- och kanbanvy.",privacy:"Markeringarna visar postområdenas ungefärliga centrum, inte privata adresser.",help:"Klicka på en markering för att se annonsen uppe till höger. Klicka på annonsen för att öppna den. Dra kartan eller använd piltangenterna och +/−.",wheel:"Klicka i kartan för att zooma med mushjulet. Tryck Escape för att rulla sidan igen.",error:"Kartbilderna kunde inte laddas. Du kan fortfarande välja annonser eller använda listvyn."},
 nb:{title:"Søkeresultater på kart",preview:"Valgte annonser",open:"Åpne annonse",close:"Lukk forhåndsvisning",zoomIn:"Zoom inn",zoomOut:"Zoom ut",fit:"Vis alle resultater",free:"Gratis",items:"ting",from:"Fra",day:"per dag",missing:"Noen annonser mangler et gyldig postområde og vises bare i liste- og kanbanvisning.",privacy:"Markeringene viser postområdenes omtrentlige sentrum, ikke private adresser.",help:"Klikk på en markering for å se annonsen øverst til høyre. Klikk på annonsen for å åpne den. Dra kartet eller bruk piltastene og +/−.",wheel:"Klikk i kartet for å zoome med musehjulet. Trykk Escape for å rulle siden igjen.",error:"Kartbildene kunne ikke lastes inn. Du kan fortsatt velge annonser eller bruke listevisning."},
};

export function ListingResultsMap({items,lang,onOpen}:{items:MapListing[];lang:Lang;onOpen:(id:string)=>void}) {
 const c=resultsMapCopy[lang],helpId=useId(),ref=useRef<HTMLDivElement>(null),interactionRef=useRef<HTMLDivElement>(null),fitted=useRef(false);
 const drag=useRef<{id:number;x:number;y:number;worldX:number;worldY:number}|null>(null);
 const points=useMemo(()=>items.flatMap(item=>{const area=publicOwnerArea(item.place);return area?[{item,area}]:[];}),[items]);
 const [size,setSize]=useState({width:0,height:480}),[view,setView]=useState<ListingMapView>(()=>fitListingMap(points.map(p=>p.area),720,480));
 const [selectedIds,setSelectedIds]=useState<string[]>([]),[failed,setFailed]=useState(false),[wheelActive,setWheelActive]=useState(false);
 useEffect(()=>{
   if(!ref.current)return;
   const observer=new ResizeObserver(([entry])=>{
     const {width,height}=entry.contentRect;setSize({width,height});
     if(width>0&&!fitted.current){setView(fitListingMap(points.map(p=>p.area),width,height));fitted.current=true;}
   });observer.observe(ref.current);return()=>observer.disconnect();
 },[points]);
 useEffect(()=>{if(!interactionRef.current)return;return bindMapWheel(interactionRef.current,step=>setView(current=>({...current,zoom:Math.max(4,Math.min(13,current.zoom+step))})),setWheelActive);},[]);
 const clusters=clusterListingMap(points,view,size.width,size.height),tiles=listingMapTiles(view,size.width,size.height);
 const selected=items.filter(item=>selectedIds.includes(item.id));
 const price=(item:MapListing)=>item.dailyPrice===0?c.free:money(item.dailyPrice,item.country,lang);
 function markerLabel(group:MapListing[]){
   if(new Set(group.map(item=>item.country)).size>1)return `${group.length} ${c.items}`;
   const min=group.reduce((a,b)=>a.dailyPrice<=b.dailyPrice?a:b),same=group.every(item=>item.dailyPrice===min.dailyPrice);
   return `${same?"":`${c.from} `}${price(min)}${group.length>1?` · ${group.length}`:""}`;
 }
 function zoom(step:number){setView(current=>({...current,zoom:Math.max(4,Math.min(13,current.zoom+step))}));}
 function pointerDown(event:PointerEvent<HTMLDivElement>){
   if(event.button!==0||(event.target as HTMLElement).closest('button,a'))return;
   event.currentTarget.focus({preventScroll:true});event.currentTarget.setPointerCapture(event.pointerId);
   const world=projectMapPoint(view,view.zoom);drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,worldX:world.x,worldY:world.y};
 }
 function pointerMove(event:PointerEvent<HTMLDivElement>){
   const start=drag.current;if(!start||start.id!==event.pointerId)return;
   const point=unprojectMapPoint(start.worldX-event.clientX+start.x,start.worldY-event.clientY+start.y,view.zoom);setView(current=>({...current,...point}));
 }
 function keyboard(event:KeyboardEvent<HTMLDivElement>){
   if(event.target!==event.currentTarget)return;
   if(['+','=','-'].includes(event.key)){event.preventDefault();zoom(event.key==='-'?-1:1);return;}
   const delta:Record<string,[number,number]>={ArrowLeft:[-70,0],ArrowRight:[70,0],ArrowUp:[0,-70],ArrowDown:[0,70]};
   const direction=delta[event.key];if(!direction)return;event.preventDefault();
   const world=projectMapPoint(view,view.zoom);setView({...view,...unprojectMapPoint(world.x+direction[0],world.y+direction[1],view.zoom)});
 }
 return <section className="listing-results-map" aria-label={c.title}>
  <p id={helpId} className="listing-map-help">{c.help}</p>
  <div ref={ref} className="listing-map-canvas">
   <div ref={interactionRef} className="listing-map-interaction" role="group" tabIndex={0} aria-label={c.title} aria-describedby={helpId} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onKeyDown={keyboard}>
   {tiles.map(tile=><Image unoptimized key={tile.key} src={tile.url} width={256} height={256} alt="" draggable={false} onError={()=>setFailed(true)} className="listing-map-tile" style={{left:tile.left,top:tile.top}}/>)}
   {clusters.map(cluster=><button type="button" key={cluster.key} className="listing-map-marker" style={{left:cluster.x,top:cluster.y}} aria-pressed={cluster.items.some(item=>selectedIds.includes(item.id))} aria-label={cluster.items.length===1?`${cluster.items[0].name}, ${price(cluster.items[0])}, ${cluster.items[0].city}`:`${cluster.items.length} ${c.items}: ${cluster.items.map(item=>item.name).join(', ')}`} onClick={()=>setSelectedIds(cluster.items.map(item=>item.id))}>{markerLabel(cluster.items)}</button>)}
   <div className="listing-map-controls"><button type="button" aria-label={c.zoomIn} onClick={()=>zoom(1)} disabled={view.zoom===13}><Plus size={18}/></button><button type="button" aria-label={c.zoomOut} onClick={()=>zoom(-1)} disabled={view.zoom===4}><Minus size={18}/></button><button type="button" aria-label={c.fit} onClick={()=>{setView(fitListingMap(points.map(p=>p.area),size.width,size.height));setSelectedIds([]);}}><Scan size={18}/></button></div>
   </div>
   {selected.length>0&&<aside className="listing-map-preview" aria-label={c.preview} aria-live="polite"><header><strong>{c.preview}</strong><button type="button" aria-label={c.close} onClick={()=>setSelectedIds([])}><X size={17}/></button></header><div>{selected.map(item=><button type="button" key={item.id} className="listing-map-preview-card" aria-label={`${c.open}: ${item.name}`} onClick={()=>onOpen(item.id)}>{item.photos?.[0]?.src?<Image unoptimized src={item.photos[0].src} width={240} height={125} alt=""/>:<span className="listing-map-preview-placeholder"><PackageOpen size={30}/></span>}<span><b>{item.name}</b><small>{item.owner}</small><small><MapPin size={12}/>{item.city}</small><strong>{price(item)}{item.dailyPrice>0?` ${c.day}`:""}</strong></span></button>)}</div></aside>}
   <a className="listing-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>
  </div>
  {failed&&<p role="status">{c.error}</p>}{points.length<items.length&&<p>{c.missing}</p>}<p className="listing-map-privacy">{c.privacy} {!wheelActive&&c.wheel}</p>
 </section>;
}
