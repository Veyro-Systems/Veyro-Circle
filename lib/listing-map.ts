export type MapLocation={lat:number;lon:number};
export type ListingMapView=MapLocation&{zoom:number};
export function projectMapPoint(point:MapLocation,zoom:number) {
  const size=256*2**zoom,lat=Math.max(-85,Math.min(85,point.lat))*Math.PI/180;
  return {x:(point.lon+180)/360*size,y:(1-Math.log(Math.tan(lat)+1/Math.cos(lat))/Math.PI)/2*size};
}
export function unprojectMapPoint(x:number,y:number,zoom:number):MapLocation {
  const size=256*2**zoom,n=Math.PI-2*Math.PI*y/size;
  return {lat:Math.max(-85,Math.min(85,180/Math.PI*Math.atan(Math.sinh(n)))),lon:Math.max(-180,Math.min(180,x/size*360-180))};
}
export function fitListingMap(points:MapLocation[],width:number,height:number):ListingMapView {
  if(!points.length)return {lat:56,lon:12,zoom:6};
  for(let zoom=11;zoom>=4;zoom--){
    const positions=points.map(p=>projectMapPoint(p,zoom));
    const minX=Math.min(...positions.map(p=>p.x)),maxX=Math.max(...positions.map(p=>p.x)),minY=Math.min(...positions.map(p=>p.y)),maxY=Math.max(...positions.map(p=>p.y));
    if(zoom===4||(maxX-minX<=Math.max(80,width-120)&&maxY-minY<=Math.max(80,height-120)))return {...unprojectMapPoint((minX+maxX)/2,(minY+maxY)/2,zoom),zoom};
  }
  return {...points[0],zoom:4};
}
export function listingMapTiles(view:ListingMapView,width:number,height:number) {
  if(width<=0||height<=0)return [];
  const centre=projectMapPoint(view,view.zoom),count=2**view.zoom,tiles=[];
  for(let x=Math.floor((centre.x-width/2)/256);x<=Math.floor((centre.x+width/2)/256);x++)for(let y=Math.max(0,Math.floor((centre.y-height/2)/256));y<=Math.min(count-1,Math.floor((centre.y+height/2)/256));y++)tiles.push({key:`${view.zoom}-${x}-${y}`,url:`https://tile.openstreetmap.org/${view.zoom}/${((x%count)+count)%count}/${y}.png`,left:x*256-centre.x+width/2,top:y*256-centre.y+height/2});
  return tiles;
}

// Combine neighbouring markers so listings in the same postcode remain selectable.
export function clusterListingMap<T>(points:Array<{item:T;area:MapLocation}>,view:ListingMapView,width:number,height:number) {
  const centre=projectMapPoint(view,view.zoom),clusters=new Map<string,{key:string;x:number;y:number;items:T[]}>();
  for(const point of points){
    const world=projectMapPoint(point.area,view.zoom),x=world.x-centre.x+width/2,y=world.y-centre.y+height/2;
    if(x<0||x>width||y<0||y>height)continue;
    const key=`${Math.floor(x/80)}:${Math.floor(y/55)}`,existing=clusters.get(key);
    if(existing)existing.items.push(point.item);else clusters.set(key,{key,x,y,items:[point.item]});
  }
  return [...clusters.values()];
}
