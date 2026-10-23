"use client";
import { nbText } from "@/lib/norwegian-copy";


import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, Minus, Plus, UsersRound } from "lucide-react";
import { loadCommunityMap, type CommunityMapPoint } from "@/lib/firebase-community";
import type { Lang, Place } from "@/lib/marketplace";
import { fitCommunityView } from "@/lib/community-map-fit";
import { bindMapWheel } from "@/lib/map-wheel";

const TILE_SIZE = 256;
const MIN_ZOOM = 2;
const MAX_ZOOM = 13;

type MapView = {lat:number;lon:number;zoom:number};
type MapSize = {width:number;height:number};
type ScreenPoint = CommunityMapPoint & {x:number;y:number};
type Cluster = {x:number;y:number;lat:number;lon:number;count:number;points:ScreenPoint[]};

function clampLat(lat:number) { return Math.max(-85.0511,Math.min(85.0511,lat)); }

function toWorld(lat:number, lon:number, zoom:number) {
  const size = TILE_SIZE * 2 ** zoom;
  const safeLat = clampLat(lat) * Math.PI / 180;
  return {
    x:(lon + 180) / 360 * size,
    y:(1 - Math.log(Math.tan(safeLat) + 1 / Math.cos(safeLat)) / Math.PI) / 2 * size,
  };
}

function fromWorld(x:number, y:number, zoom:number) {
  const size = TILE_SIZE * 2 ** zoom;
  const lon = x / size * 360 - 180;
  const n = Math.PI - 2 * Math.PI * y / size;
  return {lat:180 / Math.PI * Math.atan(Math.sinh(n)),lon};
}

function screenPosition(lat:number, lon:number, view:MapView, size:MapSize) {
  const center = toWorld(view.lat,view.lon,view.zoom);
  const point = toWorld(lat,lon,view.zoom);
  return {x:point.x-center.x+size.width/2,y:point.y-center.y+size.height/2};
}

type CommunityMapProps = {origin:Place;radiusKm:number|null;lang:Lang};

export function CommunityMap({origin,radiusKm,lang}:CommunityMapProps) {
  const [points,setPoints] = useState<CommunityMapPoint[]>([]);
  const [loading,setLoading] = useState(true);
  const [loadError,setLoadError] = useState(false);

  useEffect(()=>{
    let active = true;
    loadCommunityMap().then(data=>active && setPoints(data)).catch(()=>active && setLoadError(true)).finally(()=>active && setLoading(false));
    return ()=>{active=false;};
  },[]);

  return <CommunityMapCanvas key={`${origin.id}-${radiusKm ?? "all"}`} origin={origin} radiusKm={radiusKm} lang={lang} points={points} loading={loading} loadError={loadError} />;
}

function CommunityMapCanvas({lang,points,loading,loadError}:CommunityMapProps & {points:CommunityMapPoint[];loading:boolean;loadError:boolean}) {
  const da = lang === "da";
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{pointerId:number;x:number;y:number;centerX:number;centerY:number;moved:boolean}|null>(null);
  const [size,setSize] = useState<MapSize>({width:720,height:390});
  const fittedView=useMemo(()=>fitCommunityView(points,size),[points,size]);
  const [lastFitted,setLastFitted]=useState(fittedView);
  const [view,setView] = useState<MapView>(fittedView);
  const [selected,setSelected] = useState<Cluster|null>(null);
  const [wheelActive,setWheelActive] = useState(false);

  useEffect(()=>{
    const node = containerRef.current;
    if (!node) return;
    return bindMapWheel(node, amount=>{
      setView(current=>({...current,zoom:Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,current.zoom+amount))}));
      setSelected(null);
    },setWheelActive);
  },[]);

  useEffect(()=>{
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));
    observer.observe(node);
    return ()=>observer.disconnect();
  },[]);

  if(lastFitted!==fittedView){setLastFitted(fittedView);setView(fittedView);setSelected(null);}

  const centerWorld = useMemo(()=>toWorld(view.lat,view.lon,view.zoom),[view]);
  const tiles = useMemo(()=>{
    const count = 2 ** view.zoom;
    const minX = Math.floor((centerWorld.x-size.width/2)/TILE_SIZE)-1;
    const maxX = Math.floor((centerWorld.x+size.width/2)/TILE_SIZE)+1;
    const minY = Math.max(0,Math.floor((centerWorld.y-size.height/2)/TILE_SIZE)-1);
    const maxY = Math.min(count-1,Math.floor((centerWorld.y+size.height/2)/TILE_SIZE)+1);
    const result:Array<{key:string;url:string;left:number;top:number}>=[];
    for (let x=minX;x<=maxX;x++) for (let y=minY;y<=maxY;y++) {
      const wrappedX = ((x%count)+count)%count;
      result.push({key:`${view.zoom}-${x}-${y}`,url:`https://tile.openstreetmap.org/${view.zoom}/${wrappedX}/${y}.png`,left:x*TILE_SIZE-centerWorld.x+size.width/2,top:y*TILE_SIZE-centerWorld.y+size.height/2});
    }
    return result;
  },[centerWorld,size,view.zoom]);

  const clusters = useMemo(()=>{
    const grid = view.zoom <= 6 ? 130 : view.zoom <= 8 ? 90 : 58;
    const buckets = new Map<string,ScreenPoint[]>();
    for (const point of points) {
      const screen = screenPosition(point.lat,point.lon,view,size);
      if (screen.x < -80 || screen.y < -80 || screen.x > size.width+80 || screen.y > size.height+80) continue;
      const item = {...point,...screen};
      const key = `${Math.floor(screen.x/grid)}:${Math.floor(screen.y/grid)}`;
      buckets.set(key,[...(buckets.get(key)??[]),item]);
    }
    return [...buckets.values()].map(items=>{
      const count = items.reduce((sum,item)=>sum+item.count,0);
      const weighted = items.reduce((sum,item)=>({x:sum.x+item.x*item.count,y:sum.y+item.y*item.count,lat:sum.lat+item.lat*item.count,lon:sum.lon+item.lon*item.count}),{x:0,y:0,lat:0,lon:0});
      return {x:weighted.x/count,y:weighted.y/count,lat:weighted.lat/count,lon:weighted.lon/count,count,points:items};
    });
  },[points,size,view]);

  function changeZoom(amount:number) {
    setView(current=>({...current,zoom:Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,current.zoom+amount))}));
    setSelected(null);
  }

  function resetView() {
    setView(fitCommunityView(points,size));
    setSelected(null);
  }

  function pointerDown(event:React.PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || (event.target as HTMLElement).closest("button,a")) return;
    const center = toWorld(view.lat,view.lon,view.zoom);
    dragRef.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,centerX:center.x,centerY:center.y,moved:false};
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event:React.PointerEvent<HTMLDivElement>) {
    const drag=dragRef.current;
    if (!drag || drag.pointerId!==event.pointerId) return;
    const dx=event.clientX-drag.x; const dy=event.clientY-drag.y;
    if (Math.abs(dx)+Math.abs(dy)>3) drag.moved=true;
    const next=fromWorld(drag.centerX-dx,drag.centerY-dy,view.zoom);
    setView(current=>({...current,lat:clampLat(next.lat),lon:next.lon}));
    setSelected(null);
  }

  function pointerUp(event:React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId===event.pointerId) dragRef.current=null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function clusterLabel(cluster:Cluster) {
    const areas=[...new Map(cluster.points.map(point=>[`${point.country}:${point.postcode}`,point])).values()];
    if (areas.length===1) return `${areas[0].postcode} ${areas[0].city}`;
    const cities=[...new Set(areas.map(point=>point.city))];
    return cities.length<=2 ? cities.join(" · ") : ((lang === "nb" ? `${areas.length} postområder` : (da ? `${areas.length} postområder` : `${areas.length} postområden`)));
  }

  return <section className="community-map-card" aria-labelledby="community-map-title">
    <h2 id="community-map-title" className="sr-only">{lang==="sv"?"Registrerade Circle-användare":lang==="nb"?"Registrerte Circle-brukere":"Registrerede Circle-brugere"}</h2>
    <p id="map-wheel-help" className="sr-only" aria-live="polite">{wheelActive ? ((lang === "nb" ? nbText["Kortet er aktivt: Rul for at zoome. Klik udenfor kortet eller tryk Esc for at rulle siden igen."] : (da ? "Kortet er aktivt: Rul for at zoome. Klik udenfor kortet eller tryk Esc for at rulle siden igen." : "Kartan är aktiv: Rulla för att zooma. Klicka utanför kartan eller tryck Esc för att rulla sidan igen."))) : ((lang === "nb" ? nbText["Klik i kortet for at zoome med musehjulet. Du kan også bruge + og −. Med tastatur: Tryk Enter i kortet."] : (da ? "Klik i kortet for at zoome med musehjulet. Du kan også bruge + og −. Med tastatur: Tryk Enter i kortet." : "Klicka i kartan för att zooma med mushjulet. Du kan också använda + och −. Med tangentbord: Tryck Enter i kartan.")))}</p>
    <div ref={containerRef} className="community-map" role="group" tabIndex={0} aria-describedby="map-wheel-help" aria-label={(lang === "nb" ? nbText["Interaktivt kort over registrerede Circle-brugere"] : (da ? "Interaktivt kort over registrerede Circle-brugere" : "Interaktiv karta över registrerade Circle-användare"))} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
      <div className="community-map-tiles" aria-hidden="true">{tiles.map(tile=><div key={tile.key} className="community-map-tile" style={{left:tile.left,top:tile.top,backgroundImage:`url(${tile.url})`}} />)}</div>
      {clusters.map((cluster,index)=>{const diameter=Math.min(66,38+Math.log2(cluster.count+1)*7);return <button key={`${cluster.lat}-${cluster.lon}-${index}`} type="button" className="community-cluster" style={{left:cluster.x,top:cluster.y,width:diameter,height:diameter}} onPointerDown={event=>event.stopPropagation()} onClick={()=>setSelected(cluster)} aria-label={`${cluster.count} ${(lang === "nb" ? nbText["brugere"] : (da?"brugere":"användare"))} · ${clusterLabel(cluster)}`}><b>{cluster.count}</b><small>{(lang === "nb" ? nbText["brugere"] : (da?"brugere":"användare"))}</small></button>;})}
      {selected && <div className="community-map-popup" style={{left:Math.max(12,Math.min(size.width-220,selected.x-100)),top:Math.max(12,selected.y-100)}}><button type="button" onClick={()=>setSelected(null)} aria-label={(lang === "nb" ? nbText["Luk"] : (da?"Luk":"Stäng"))}>×</button><b>{clusterLabel(selected)}</b><span>{selected.count} {(lang === "nb" ? nbText["registrerede Circle-brugere"] : (da ? "registrerede Circle-brugere" : "registrerade Circle-användare"))}</span></div>}
      {loading && <div className="community-map-message">{(lang === "nb" ? nbText["Henter brugerfordelingen…"] : (da?"Henter brugerfordelingen…":"Hämtar användarfördelningen…"))}</div>}
      {loadError && <div className="community-map-message is-error">{(lang === "nb" ? nbText["Brugerfordelingen kunne ikke hentes lige nu."] : (da?"Brugerfordelingen kunne ikke hentes lige nu.":"Användarfördelningen kunde inte hämtas just nu."))}</div>}
      <div className="community-map-controls"><button type="button" onClick={()=>changeZoom(1)} disabled={view.zoom>=MAX_ZOOM} aria-label={(lang === "nb" ? nbText["Zoom ind"] : (da?"Zoom ind":"Zooma in"))}><Plus size={19}/></button><button type="button" onClick={()=>changeZoom(-1)} disabled={view.zoom<=MIN_ZOOM} aria-label={(lang === "nb" ? nbText["Zoom ud"] : (da?"Zoom ud":"Zooma ut"))}><Minus size={19}/></button><button type="button" onClick={resetView} aria-label={(lang === "nb" ? "Vis alle registrerte" : (da?"Vis alle tilmeldte":"Visa alla registrerade"))}><LocateFixed size={19}/></button></div>
      <div className="community-map-legend"><span><UsersRound size={17}/>{points.reduce((sum,point)=>sum+point.count,0)} {lang==="sv"?"registrerade":lang==="nb"?"registrerte":"registrerede"}</span><span><b>12</b>{lang==="sv"?"Användare per område":lang==="nb"?"Brukere per område":"Brugere pr. område"}</span></div>
      <a className="community-map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>
    </div>
    <p className="community-map-privacy">{(lang === "nb" ? nbText["Kortet viser kun samlede antal ved postnummerets omtrentlige centrum. Navne, adresser og telefonnumre vises ikke."] : (da ? "Kortet viser kun samlede antal ved postnummerets omtrentlige centrum. Navne, adresser og telefonnumre vises ikke." : "Kartan visar endast sammanlagda antal vid postnumrets ungefärliga centrum. Namn, adresser och telefonnummer visas inte."))}</p>
  </section>;
}
