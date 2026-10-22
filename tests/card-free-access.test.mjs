import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const load=createTsLoader();
const {circleAccess}=load('@/lib/circle-access');

test('free access has five slots permanently regardless of legacy dates or missing history',()=>{
 for(const createdAt of [undefined,'invalid','2000-01-01','2099-01-01'])for(const freeAccessStartedAt of [undefined,'2020-01-01','invalid']){
  assert.deepEqual(circleAccess({subscriptionPlan:'free',createdAt,freeAccessStartedAt}),{plan:'free',canUseApp:true,paymentRequired:false,listingLimit:5});
 }
});

test('only the server-maintained Plus entitlement raises the permanent free limit',()=>{
 for(const subscriptionPlan of [undefined,'expired','unknown','free'])assert.equal(circleAccess({subscriptionPlan}).listingLimit,5);
 for(const subscriptionStatus of ['active','trialing'])assert.equal(circleAccess({createdAt:'2020-01-01',subscriptionPlan:'plus',subscriptionStatus}).listingLimit,20);
});

test('every country and language communicates permanent free access and optional Plus',()=>{
 const {membershipCopy,membershipPrice}=load('@/lib/membership-copy');
 assert.equal(membershipPrice('DK'),'29 DKK');assert.equal(membershipPrice('SE'),'43 SEK');assert.equal(membershipPrice('NO'),'41 NOK');
 for(const c of Object.values(membershipCopy)){assert.doesNotMatch(c.terms,/180/);assert.match(c.terms,/5/);assert.match(c.terms,/29 DKK/);assert.match(c.terms,/43 SEK/);assert.match(c.terms,/41 NOK/);assert.match(c.terms,/Ingen automatisk/);assert.match(c.terms,/uden tidsgrænse|utan tidsgräns|uten tidsgrense/);assert.match(c.five,/5/);assert.match(c.payment,/aktivt/);}
});

test('profile creation cannot forge paid access and edits preserve historical billing dates',async()=>{
 let current=null;const writes=[];
 const route=createTsLoader({'@/lib/firebase-server':{verifyFirebaseRequest:async()=>({localId:'unit-free',email:'unit@example.invalid',createdAt:String(Date.now()-86400000)}),getFirestoreDocument:async p=>p==='users/unit-free'?current:null,firestoreDocumentName:p=>p,commitFirestoreWrites:async w=>writes.push(...w)},'@/lib/server-config':{serverConfig:()=> 'unit-identity-key-not-secret'}})('@/app/api/profile/route');
 const body={name:'Unit member',email:'unit@example.invalid',phone:'12345678',street:'Unitvej 12',place:{id:'1',country:'DK',postcode:'4174',city:'Jystrup'},createdAt:'2099-01-01',freeAccessStartedAt:'2099-01-01',subscriptionPlan:'plus'};
 const request=()=>new Request('https://unit.example.invalid/api/profile',{method:'POST',body:JSON.stringify(body)});
 assert.equal((await route.POST(request())).status,200);
 const first=writes.find(w=>w.update?.name==='users/unit-free');assert.equal(first.update.fields.subscriptionPlan.stringValue,'free');assert.notEqual(first.update.fields.createdAt.timestampValue,body.createdAt);assert.equal(first.update.fields.freeAccessStartedAt,undefined);
 current={fields:{...first.update.fields,freeAccessStartedAt:{timestampValue:'2020-01-01T00:00:00Z'},circlePlusStartedAt:{timestampValue:'2021-01-01T00:00:00Z'}},updateTime:'old'};writes.length=0;assert.equal((await route.POST(request())).status,200);
 const edited=writes.find(w=>w.update?.name==='users/unit-free');for(const key of ['createdAt','freeAccessStartedAt','subscriptionPlan','circlePlusStartedAt'])assert.equal(edited.updateMask.fieldPaths.includes(key),false);
});
