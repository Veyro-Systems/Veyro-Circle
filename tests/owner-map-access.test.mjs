import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const saved={uids:process.env.CIRCLE_MAP_OWNER_UIDS,emails:process.env.CIRCLE_MAP_OWNER_EMAILS,fetch:globalThis.fetch};
afterEach(()=>{for(const [key,value] of [['CIRCLE_MAP_OWNER_UIDS',saved.uids],['CIRCLE_MAP_OWNER_EMAILS',saved.emails]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}globalThis.fetch=saved.fetch;});
function setup(identity={localId:'ordinary',email:'ordinary@example.test',emailVerified:true}) {
 process.env.CIRCLE_MAP_OWNER_UIDS='owner';process.env.CIRCLE_MAP_OWNER_EMAILS='dch@veyrosystems.com';
 let queries=0;
 const place={country:{stringValue:'DK'},postcode:{stringValue:'4174'},city:{stringValue:'Jystrup'},lat:{doubleValue:55.5},lon:{doubleValue:11.8}};
 const row={document:{fields:{place:{mapValue:{fields:place}}}}};
 globalThis.fetch=async()=>{queries++;return Response.json([row,row]);};
 const api=createTsLoader({'next/server':{NextResponse:{json:(data,options)=>Response.json(data,options)}},'@/lib/firebase-server':{verifyFirebaseRequest:async()=>{if(!identity)throw Error('AUTH_REQUIRED');return identity;},serviceToken:async()=> 'test-token'},'@/lib/server-config':{serverConfig:()=> 'test-project'}})('@/app/api/community-map/route');
 return {get:query=>api.GET(new Request('https://circle.test/api/community-map'+(query??''))),queries:()=>queries};
}
test('ordinary authenticated users cannot retrieve owner map counts, including forged owner parameters',async()=>{
 const s=setup();const response=await s.get('?role=owner&ownerUid=owner&email=dch%40veyrosystems.com');
 assert.equal(response.status,403);assert.deepEqual(await response.json(),{error:'OWNER_ACCESS_REQUIRED'});assert.equal(s.queries(),0);
});
test('map permission checks expose only a boolean and never query the user distribution',async()=>{
 const s=setup();const response=await s.get('?access=1');assert.equal(response.status,200);assert.deepEqual(await response.json(),{allowed:false});assert.equal(s.queries(),0);assert.match(response.headers.get('cache-control'),/private, no-store/);
});
test('only explicitly configured owners receive aggregated postcode counts',async()=>{
 const s=setup({localId:'owner',email:'owner@example.test',emailVerified:true});
 assert.deepEqual(await (await s.get('?access=1')).json(),{allowed:true});
 const response=await s.get();assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/private, no-store/);
 assert.deepEqual(await response.json(),{points:[{country:'DK',postcode:'4174',city:'Jystrup',lat:55.5,lon:11.8,count:2}]});assert.equal(s.queries(),1);
});
test('a future partner account must have the exact verified allowlisted address',async()=>{
 for(const [email,verified,expected] of [['DCH@VEYROSYSTEMS.COM',true,200],['dch@veyrosystems.com',false,403],['someone@veyrosystems.com',true,403],['dch@veyrosystems.com.attacker.test',true,403]]){
  const s=setup({localId:'new-account',email,emailVerified:verified});assert.equal((await s.get()).status,expected);assert.equal(s.queries(),expected===200?1:0);
 }
});
test('missing configuration denies map access and missing authentication returns 401',async()=>{
 const s=setup({localId:'owner',email:'dch@veyrosystems.com',emailVerified:true});delete process.env.CIRCLE_MAP_OWNER_UIDS;delete process.env.CIRCLE_MAP_OWNER_EMAILS;assert.equal((await s.get()).status,403);assert.equal(s.queries(),0);
 const guest=setup(null);assert.equal((await guest.get('?access=1')).status,401);assert.equal(guest.queries(),0);
});
