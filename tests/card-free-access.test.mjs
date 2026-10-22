import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const load=createTsLoader();
const {circleAccess}=load('@/lib/circle-access');
const day=86400000,start=Date.parse('2026-10-22T12:34:56Z');
test('each account gets exactly 180 days from its own immutable signup time',()=>{
 const a={subscriptionPlan:'free',freeAccessStartedAt:new Date(start).toISOString()};
 assert.equal(circleAccess(a,start).listingLimit,5);
 assert.equal(circleAccess(a,start+180*day-1).canUseApp,true);
 assert.equal(circleAccess(a,start+180*day).paymentRequired,true);
 assert.equal(circleAccess(a,start+180*day).listingLimit,0);
 assert.equal(circleAccess({...a,freeAccessStartedAt:new Date(start+30*day).toISOString()},start+180*day).canUseApp,true);
 assert.equal(circleAccess({...a,createdAt:new Date(start+100*day).toISOString()},start+180*day).canUseApp,false);
});
test('180-day access crosses DST and leap day without becoming six variable-length months',()=>{
 for(const date of ['2027-10-01T22:30:00Z','2028-02-01T23:30:00Z']){const t=Date.parse(date);const a={createdAt:date,subscriptionPlan:'free'};assert.equal(Date.parse(circleAccess(a,t).freeUntil)-t,180*day);assert.equal(circleAccess(a,t+180*day).paymentRequired,true);}
});
test('missing or forged future dates fail closed and legacy paid trials remain active',()=>{
 for(const createdAt of [undefined,'invalid',new Date(start+day).toISOString()])assert.equal(circleAccess({createdAt},start).canUseApp,false);
 for(const status of ['active','trialing'])assert.equal(circleAccess({createdAt:'2020-01-01',subscriptionPlan:'plus',subscriptionStatus:status},start).listingLimit,20);
});
test('every country and language communicates 5 free items without card and voluntary payment',()=>{
 const {membershipCopy,membershipPrice}=load('@/lib/membership-copy');
 assert.equal(membershipPrice('DK'),'29 DKK');assert.equal(membershipPrice('SE'),'43 SEK');assert.equal(membershipPrice('NO'),'41 NOK');
 for(const c of Object.values(membershipCopy)){assert.match(c.terms,/180/);assert.match(c.terms,/5/);assert.match(c.terms,/29 DKK/);assert.match(c.terms,/43 SEK/);assert.match(c.terms,/41 NOK/);assert.match(c.terms,/Ingen automatisk/);assert.match(c.five,/5/);assert.match(c.payment,/aktivt/);}
});

test('profile creation uses verified Firebase signup time and profile edits cannot reset it',async()=>{
 const signup=Date.now()-30*day;let current=null;const writes=[];
 const route=createTsLoader({'@/lib/firebase-server':{verifyFirebaseRequest:async()=>({localId:'unit-free',email:'unit@example.invalid',createdAt:String(signup)}),getFirestoreDocument:async p=>p==='users/unit-free'?current:null,firestoreDocumentName:p=>p,commitFirestoreWrites:async w=>writes.push(...w)},'@/lib/server-config':{serverConfig:()=> 'unit-identity-key-not-secret'}})('@/app/api/profile/route');
 const body={name:'Unit member',email:'unit@example.invalid',phone:'12345678',street:'Unitvej 12',place:{id:'1',country:'DK',postcode:'4174',city:'Jystrup'},createdAt:'2099-01-01',freeAccessStartedAt:'2099-01-01',subscriptionPlan:'plus'};
 const request=()=>new Request('https://unit.example.invalid/api/profile',{method:'POST',body:JSON.stringify(body)});
 assert.equal((await route.POST(request())).status,200);
 const first=writes.find(w=>w.update?.name==='users/unit-free');assert.equal(first.update.fields.freeAccessStartedAt.timestampValue,new Date(signup).toISOString());assert.equal(first.update.fields.subscriptionPlan.stringValue,'free');
 current={fields:first.update.fields,updateTime:'old'};writes.length=0;assert.equal((await route.POST(request())).status,200);
 const edited=writes.find(w=>w.update?.name==='users/unit-free');for(const key of ['createdAt','freeAccessStartedAt','subscriptionPlan'])assert.equal(edited.updateMask.fieldPaths.includes(key),false);
});
