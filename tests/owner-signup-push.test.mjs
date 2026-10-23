import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const saved={push:process.env.CIRCLE_PUSH_ENABLED,uids:process.env.CIRCLE_MAP_OWNER_UIDS,emails:process.env.CIRCLE_MAP_OWNER_EMAILS,fetch:globalThis.fetch};
afterEach(()=>{for(const [key,value] of [['CIRCLE_PUSH_ENABLED',saved.push],['CIRCLE_MAP_OWNER_UIDS',saved.uids],['CIRCLE_MAP_OWNER_EMAILS',saved.emails]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}globalThis.fetch=saved.fetch;});

function profileHarness({existing=false,fail=false}={}){
 const docs=new Map(),callbacks=[],sent=[];
 if(existing)docs.set('users/new-user',{fields:{name:{stringValue:'Old name'},createdAt:{timestampValue:'2020-01-01T00:00:00Z'},subscriptionPlan:{stringValue:'plus'},stripeSubscriptionId:{stringValue:'sub_preserved'}}});
 const load=createTsLoader({'next/server':{NextResponse:{json:(body,init)=>Response.json(body,init)},after:fn=>callbacks.push(fn)},'@/lib/server-config':{serverConfig:()=> 'local-test-not-secret'},'@/lib/push-server':{notifyOwnersOfSignup:async uid=>sent.push(uid)},'@/lib/firebase-server':{
  verifyFirebaseRequest:async r=>{if(r.headers.get('authorization')!=='verified')throw Error('Du skal være logget ind');return {localId:'new-user',email:'new@example.test',emailVerified:true,createdAt:String(Date.now()-1000)};},
  getFirestoreDocument:async path=>structuredClone(docs.get(path)??null),firestoreDocumentName:p=>p,
  commitFirestoreWrites:async writes=>{if(fail)throw Error('SAVE_FAILED');for(const w of writes)if(w.currentDocument?.exists===false&&docs.has(w.update?.name))throw Error('IDENTITY_CONFLICT');for(const w of writes){if(w.update){const old=docs.get(w.update.name);docs.set(w.update.name,{fields:{...old?.fields,...w.update.fields}});}else if(w.delete)docs.delete(w.delete);}},
 }});
 const route=load('@/app/api/profile/route');
 const body={name:'New member',email:'new@example.test',phone:'12345678',street:'Testvej 1',place:{id:'1',country:'DK',postcode:'4174',city:'Jystrup'},signupOwner:true,ownerUid:'attacker',notifyOwners:true};
 return {docs,callbacks,sent,call:(data=body,auth='verified')=>route.POST(new Request('https://circle.test/api/profile',{method:'POST',headers:{authorization:auth},body:JSON.stringify(data)})),body};
}

test('first verified profile schedules one owner alert only after an atomic successful create',async()=>{
 const h=profileHarness();assert.equal((await h.call()).status,200);assert.equal(h.callbacks.length,1);assert.deepEqual(h.sent,[]);
 await h.callbacks[0]();assert.deepEqual(h.sent,['new-user']);
 assert.equal((await h.call()).status,200);assert.equal(h.callbacks.length,1);
 assert.equal(h.docs.get('users/new-user').fields.signupOwner,undefined);
});
test('profile edits and language changes never replay signup or alter billing history',async()=>{
 const h=profileHarness({existing:true});const before=structuredClone(h.docs.get('users/new-user').fields);assert.equal((await h.call()).status,200);
 assert.equal(h.callbacks.length,0);for(const key of ['createdAt','subscriptionPlan','stripeSubscriptionId'])assert.deepEqual(h.docs.get('users/new-user').fields[key],before[key]);
});
test('invalid, unauthenticated and unsuccessful signups send no alert',async()=>{
 for(const h of [profileHarness(),profileHarness({fail:true})]){
  assert.equal((await h.call(h.body,'guest')).status,401);assert.equal((await h.call({...h.body,name:''})).status,400);assert.equal(h.callbacks.length,0);
 }
 const failed=profileHarness({fail:true});assert.equal((await failed.call()).status,500);assert.equal(failed.docs.size,0);assert.equal(failed.callbacks.length,0);
});
test('concurrent first-profile requests cannot duplicate the owner signup alert',async()=>{
 const h=profileHarness();const responses=await Promise.all([h.call(),h.call({...h.body,phone:'87654321'})]);
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal(h.callbacks.length,1);await h.callbacks[0]();assert.deepEqual(h.sent,['new-user']);
});

test('device registration assigns owner eligibility from verified identity, never client fields',async()=>{
 process.env.CIRCLE_PUSH_ENABLED='true';process.env.CIRCLE_MAP_OWNER_UIDS='jorn';process.env.CIRCLE_MAP_OWNER_EMAILS='dch@veyrosystems.com';
 let identity={localId:'ordinary',email:'ordinary@example.test',emailVerified:true};const writes=[];
 const api=createTsLoader({'@/lib/firebase-server':{verifyFirebaseRequest:async()=>identity,getFirestoreDocument:async()=>null,firestoreDocumentName:p=>p,commitFirestoreWrites:async w=>writes.push(...w)}})('@/app/api/push/route');
 const call=()=>api.POST(new Request('https://circle.test/api/push',{method:'POST',body:JSON.stringify({token:'device-token-12345678901234567890',lang:'da',uid:'jorn',signupOwner:true,ownerEmail:'dch@veyrosystems.com'})}));
 assert.equal((await call()).status,200);assert.equal(writes.at(-1).update.fields.signupOwner.booleanValue,false);assert.equal(writes.at(-1).update.fields.ownerEmail,undefined);
 identity={localId:'jorn',email:'jwwl@veyrosystems.com',emailVerified:true};assert.equal((await call()).status,200);assert.equal(writes.at(-1).update.fields.signupOwner.booleanValue,true);
 identity={localId:'dennis',email:'DCH@VEYROSYSTEMS.COM',emailVerified:true};assert.equal((await call()).status,200);assert.equal(writes.at(-1).update.fields.ownerEmail.stringValue,'dch@veyrosystems.com');
 identity={localId:'ordinary',email:'dch@veyrosystems.com.attacker.test',emailVerified:true};await call();assert.equal(writes.at(-1).update.fields.signupOwner.booleanValue,false);
});

test('signup delivery targets only current allowed owners with unexpired unchanged device registrations',async()=>{
 process.env.CIRCLE_PUSH_ENABLED='true';process.env.CIRCLE_MAP_OWNER_UIDS='jorn';process.env.CIRCLE_MAP_OWNER_EMAILS='dch@veyrosystems.com';
 const device=(uid,extra={})=>({name:`pushDevices/${uid}`,updateTime:'v1',fields:{uid:{stringValue:uid},token:{stringValue:uid.padEnd(30,'x')},signupOwner:{booleanValue:true},ownerEmail:{stringValue:`${uid}@example.test`},lang:{stringValue:'da'},expiresAt:{timestampValue:new Date(Date.now()+100000).toISOString()},...extra}});
 const jorn=device('jorn'),dennis=device('dennis',{ownerEmail:{stringValue:'dch@veyrosystems.com'}}),ordinary=device('ordinary'),expired=device('jorn',{expiresAt:{timestampValue:'2020-01-01T00:00:00Z'}}),switched=device('jorn',{token:{stringValue:'switched-device-token-1234567890'}});
 const rows=[jorn,dennis,ordinary,expired,switched];const sent=[];
 const api=createTsLoader({'@/lib/server-config':{serverConfig:()=> 'test-project'},'@/lib/firebase-server':{serviceToken:async()=> 'fake-access',getFirestoreDocument:async path=>path.endsWith(api.pushId(switched.fields.token.stringValue))?{...switched,updateTime:'v2',fields:{...switched.fields,uid:{stringValue:'ordinary'}}}:path.endsWith(api.pushId(dennis.fields.token.stringValue))?dennis:jorn}})('@/lib/push-server');
 globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);if(url.includes(':runQuery')){assert.deepEqual(body.structuredQuery.where.fieldFilter,{field:{fieldPath:'signupOwner'},op:'EQUAL',value:{booleanValue:true}});return Response.json(rows.map(document=>({document})));}sent.push(body.message);return Response.json({name:'test-message'});};
 await api.notifyOwnersOfSignup('new-private-user-id');assert.equal(sent.length,2);assert.ok(sent.every(m=>m.data.url==='/?push=signup'));
 assert.doesNotMatch(JSON.stringify(sent.map(m=>m.data)),/new-private-user-id|@|street|phone|email/);
 process.env.CIRCLE_MAP_OWNER_UIDS='';process.env.CIRCLE_MAP_OWNER_EMAILS='';sent.length=0;await api.notifyOwnersOfSignup('another-user');assert.equal(sent.length,0);
 globalThis.fetch=async()=>{throw Error('offline');};await assert.doesNotReject(()=>api.notifyOwnersOfSignup('new-user'));
 process.env.CIRCLE_PUSH_ENABLED='false';globalThis.fetch=()=>{throw Error('must not query when disabled');};await api.notifyOwnersOfSignup('new-user');
});
test('signup notification is generic and translated and its service-worker link has no account identifiers',()=>{
 const {pushPayload}=createTsLoader()('@/lib/push-server');
 for(const [lang,word] of [['da','ny bruger'],['sv','ny användare'],['nb','ny bruker']]){const p=pushPayload('signup','opaque-event',lang);assert.ok(p.body.includes(word));assert.equal(p.url,'/?push=signup');assert.doesNotMatch(JSON.stringify(p),/@|new-private-user-id/);}
});
