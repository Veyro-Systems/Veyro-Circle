export type MapBoundsPoint={lat:number;lon:number};
export function fitCommunityView(points:MapBoundsPoint[],size:{width:number;height:number}) {
 const valid=points.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<85.0511&&Math.abs(p.lon)<=180);
 const locations=valid.length?valid:[{lat:54.5,lon:8},{lat:57.8,lon:15.2}];
 const project=(p:MapBoundsPoint)=>({x:(p.lon+180)/360,y:(1-Math.log(Math.tan(p.lat*Math.PI/180)+1/Math.cos(p.lat*Math.PI/180))/Math.PI)/2});
 const projected=locations.map(project),xs=projected.map(p=>p.x),ys=projected.map(p=>p.y);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const width=Math.max(1,size.width-112),height=Math.max(1,size.height-144);
 const zoom=Math.max(2,Math.min(10,Math.floor(Math.log2(Math.min(width/(256*Math.max(maxX-minX,1e-9)),height/(256*Math.max(maxY-minY,1e-9)))))));
 return {lat:Math.atan(Math.sinh(Math.PI-2*Math.PI*(minY+maxY)/2))*180/Math.PI,lon:(minX+maxX)/2*360-180,zoom};
}
