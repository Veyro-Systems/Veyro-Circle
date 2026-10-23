import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const {fitListingMap,projectMapPoint,unprojectMapPoint,clusterListingMap,listingMapTiles}=createTsLoader()('@/lib/listing-map');
test('map bounds contain matching Danish Swedish and Norwegian listings at desktop and mobile sizes',()=>{
 const points=[{lat:55.52,lon:11.86},{lat:59.33,lon:18.07},{lat:59.91,lon:10.75}];
 for(const [width,height] of [[760,500],[340,430]]){
  const view=fitListingMap(points,width,height),centre=projectMapPoint(view,view.zoom);
  for(const point of points){const p=projectMapPoint(point,view.zoom);assert.ok(p.x-centre.x+width/2>=40&&p.x-centre.x+width/2<=width-40);assert.ok(p.y-centre.y+height/2>=40&&p.y-centre.y+height/2<=height-40);}
  assert.ok(listingMapTiles(view,width,height).length>0);
 }
});
test('co-located listings remain separately selectable and only provided search matches are included',()=>{
 const area={lat:55.52,lon:11.86},view=fitListingMap([area],500,430);
 const clusters=clusterListingMap([{item:{id:'bag-small'},area},{item:{id:'bag-large'},area}],view,500,430);
 assert.equal(clusters.length,1);assert.deepEqual(clusters[0].items.map(item=>item.id),['bag-small','bag-large']);
 assert.equal(clusterListingMap([],view,500,430).length,0);
 const far={lat:70,lon:25};assert.equal(clusterListingMap([{item:{id:'outside'},area:far}],view,500,430).length,0);
});
test('map pan projection round trips and empty dimensions request no tiles',()=>{
 for(const point of [{lat:55.52,lon:11.86},{lat:78.22,lon:15.65}]){
  const world=projectMapPoint(point,11),result=unprojectMapPoint(world.x,world.y,11);
  assert.ok(Math.abs(point.lat-result.lat)<1e-8);assert.ok(Math.abs(point.lon-result.lon)<1e-8);
 }
 assert.deepEqual(listingMapTiles({lat:55,lon:12,zoom:11},0,430),[]);
});
