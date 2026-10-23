import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const {rankListingReviews}=createTsLoader()('@/lib/listing-popularity');
const items=[{id:'first',ownerUid:'owner'},{id:'second',ownerUid:'owner'},{id:'third',ownerUid:'other'}];
const review=(listingId,stars,extra={})=>({listingId,stars,maxStars:6,subjectUid:listingId==='third'?'other':'owner',subjectRole:'lender',authorUid:'borrower',agreementId:`agreement-${listingId}-${stars}`,...extra});
test('popularity uses the highest per-item average on the common six-point scale, including ties',()=>{
 const result=rankListingReviews(items,[review('first',5),review('first',6),review('second',5),review('third',5,{maxStars:5})]);
 assert.deepEqual(result.first,{average:5.5,count:2,popular:false});assert.equal(result.third.average,6);assert.equal(result.third.popular,true);assert.equal(result.second.popular,false);
 const ties=rankListingReviews(items,[review('first',6),review('second',5,{maxStars:5})]);assert.equal(ties.first.popular,true);assert.equal(ties.second.popular,true);assert.equal(ties.third,undefined);
});
test('unreviewed, forged, self and borrower ratings cannot earn a badge or inflate the count',()=>{
 assert.deepEqual(rankListingReviews(items,[]),{});
 const valid=review('first',5);
 const result=rankListingReviews(items,[valid,valid,review('second',6,{subjectRole:'borrower'}),review('third',6,{subjectUid:'wrong'}),review('first',6,{authorUid:'owner'}),review('first',7),review('first',0),review('first',2.5),review('first',6,{maxStars:10}),review('first',6,{subjectRole:undefined}),review('unknown',6)]);
 assert.deepEqual(result,{first:{average:5,count:1,popular:true}});
});
test('legacy reviews require a completed matching rental; only rating metadata is queried',async()=>{
 const {encodeFields}=createTsLoader()('@/lib/firestore-values');const originalFetch=globalThis.fetch,requests=[];
 globalThis.fetch=async(url,init)=>{requests.push(JSON.parse(init.body).structuredQuery);return Response.json([review('first',5,{subjectRole:undefined,maxStars:5}),review('second',6,{subjectRole:undefined})].map(r=>({document:{fields:encodeFields(Object.fromEntries(Object.entries(r).filter(([,v])=>v!==undefined)))}})));};
 try{
  const {listingPopularity}=createTsLoader({'@/lib/firebase-server':{serviceToken:async()=> 'not-a-real-token',getFirestoreDocument:async path=>({fields:encodeFields({lenderUid:'owner',borrowerUid:'borrower',item:{id:path.includes('first')?'first':'second'},...(path.includes('first')?{returnedAt:'2026-10-01'}:{requestStatus:'accepted'})})})},'@/lib/server-config':{serverConfig:()=> 'test-project'}})('@/lib/listing-popularity');
  const result=await listingPopularity(items);assert.deepEqual(result,{first:{average:6,count:1,popular:true}});const fields=requests[0].select.fields.map(f=>f.fieldPath);assert.ok(fields.includes('listingId'));assert.ok(!fields.includes('text'));assert.ok(!fields.includes('author'));assert.equal(requests[0].where.fieldFilter.op,'IN');
 }finally{globalThis.fetch=originalFetch;}
});
test('unavailable reviews fail closed without making the listing feed unavailable',async()=>{
 const {listingPopularity}=createTsLoader({'@/lib/firebase-server':{serviceToken:async()=>{throw Error('private-error');}}})('@/lib/listing-popularity');assert.deepEqual(await listingPopularity(items),{});assert.deepEqual(await listingPopularity([]),{});
});
test('feed derives ratings server-side and never reuses arbitrary stored popular flags',async()=>{
 const {encodeFields}=createTsLoader()('@/lib/firestore-values'),originalFetch=globalThis.fetch;
 globalThis.fetch=async()=>Response.json([{document:{name:'listings/first',fields:encodeFields({active:true,ownerUid:'owner',name:'Item',popular:true,reviewRating:{average:6,count:999,popular:true}})}}]);
 try{
  const route=createTsLoader({'@/lib/firebase-server':{serviceToken:async()=> 'fake',getFirestoreDocument:async()=>({fields:{}})},'@/lib/server-config':{serverConfig:()=> 'test'},'@/lib/listing-access':{publishableIds:()=>['first']},'@/lib/listing-popularity':{listingPopularity:async input=>{assert.deepEqual(input,[{id:'first',ownerUid:'owner'}]);return {first:{average:5,count:1,popular:true}};}}})('@/app/api/listings/feed/route');
  const response=await route.GET(new Request('https://circle.test/api/listings/feed'));assert.equal(response.status,200);const {listings}=await response.json();assert.deepEqual(listings[0].reviewRating,{average:5,count:1,popular:true});assert.equal(listings[0].popular,undefined);
 }finally{globalThis.fetch=originalFetch;}
});
