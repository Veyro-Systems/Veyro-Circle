import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const load=createTsLoader(),{places}=load('@/lib/marketplace'),{publicOwnerArea}=load('@/lib/public-owner-area'),{ownerAreaMapLayout}=load('@/lib/owner-area-map');
test('public owner maps use canonical postal centres in all three countries, never stored private coordinates',()=>{
 for(const country of ['DK','SE','NO']){
  const known=places.find(p=>p.country===country),area=publicOwnerArea({...known,lat:55.123456789,lon:11.123456789,street:'Private house 8',email:'private@example.test'});
  assert.deepEqual(area,{country,postcode:known.postcode,city:known.city,lat:known.lat,lon:known.lon});
  assert.doesNotMatch(JSON.stringify(area),/Private house|private@example|55\.123456789|11\.123456789/);
  const map=ownerAreaMapLayout(area,360,230);assert.ok(map.tiles.length>0&&map.tiles.length<=9);assert.ok(map.radius>0&&map.radius<115);
  assert.ok(map.tiles.every(t=>/^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(t.url)));
 }
});
test('unknown postcodes cannot fall back to arbitrary profile coordinates',()=>{
 for(const input of [null,{}, {country:'US',postcode:'4174',lat:55,lon:12},{country:'DK',postcode:'unknown',city:'Jystrup',lat:55.5,lon:11.8}])assert.equal(publicOwnerArea(input),null);
});
