import type {PublicOwnerArea} from "./public-owner-area";

export function ownerAreaMapLayout(area:PublicOwnerArea,width:number,height:number) {
  if(!Number.isFinite(area.lat)||!Number.isFinite(area.lon)||Math.abs(area.lat)>85||Math.abs(area.lon)>180||width<=0||height<=0)return {tiles:[],radius:0};
  const zoom=area.lat>=68?10:11,count=2**zoom,size=256*count;
  const lat=area.lat*Math.PI/180;
  const x=(area.lon+180)/360*size,y=(1-Math.log(Math.tan(lat)+1/Math.cos(lat))/Math.PI)/2*size;
  const tiles=[];
  for(let tx=Math.floor((x-width/2)/256);tx<=Math.floor((x+width/2)/256);tx++){
    for(let ty=Math.max(0,Math.floor((y-height/2)/256));ty<=Math.min(count-1,Math.floor((y+height/2)/256));ty++){
      tiles.push({key:`${zoom}-${tx}-${ty}`,url:`https://tile.openstreetmap.org/${zoom}/${((tx%count)+count)%count}/${ty}.png`,left:tx*256-x+width/2,top:ty*256-y+height/2});
    }
  }
  return {tiles,radius:2000*size/(40075016.686*Math.cos(lat))};
}
