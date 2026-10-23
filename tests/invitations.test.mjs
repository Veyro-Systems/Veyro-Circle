import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTsLoader} from './load-typescript.mjs';
const previous={fetch:globalThis.fetch,window:globalThis.window,uids:process.env.CIRCLE_MAP_OWNER_UIDS,emails:process.env.CIRCLE_MAP_OWNER_EMAILS};
afterEach(()=>{globalThis.fetch=previous.fetch;if(previous.window===undefined)delete globalThis.window;else globalThis.window=previous.window;for(const [k,v] of [['CIRCLE_MAP_OWNER_UIDS',previous.uids],['CIRCLE_MAP_OWNER_EMAILS',previous.emails]]){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
const code='AbCdEf012345-_ab';
const client=createTsLoader()('@/lib/invitation-client');
function storage(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),values};}
test('accepted invitation survives verification for 30 days and invalid or expired storage is discarded',()=>{
 const s=storage(),now=Date.now();assert.equal(client.validInviteCode(code),true);assert.equal(client.validInviteCode('users/uid'),false);
 assert.equal(client.rememberInviteFromUrl('https://circle.test/?invite='+code,s,now),true);assert.equal(client.pendingInvite(s,now+1),code);
 assert.equal(client.rememberInviteFromUrl('https://circle.test/',s,now),false);assert.equal(client.pendingInvite(s,now+1),code);
 assert.equal(client.rememberInviteFromUrl('https://circle.test/?invite=bad',s,now),false);assert.equal(client.pendingInvite(s,now+1),code);
 assert.equal(client.pendingInvite(s,now+client.INVITE_LIFETIME_MS),undefined);assert.equal(s.getItem(client.INVITE_STORAGE_KEY),null);
 for(const value of ['not-json',JSON.stringify({code,expiresAt:now+1000}),JSON.stringify({code:'bad',expiresAt:now+1000,consentVersion:client.INVITATION_CONSENT_VERSION})]){s.setItem(client.INVITE_STORAGE_KEY,value);assert.equal(client.pendingInvite(s,now),undefined);}
});
test('links retain the chosen language without exposing sender identifiers',()=>{
 for(const lang of ['da','sv','nb']){const url=new URL(client.invitationLink(code,lang,'https://veyro-circle.netlify.app/account'));assert.equal(url.origin,'https://veyro-circle.netlify.app');assert.equal(url.pathname,'/');assert.equal(url.searchParams.get('invite'),code);assert.equal(url.searchParams.get('lang'),lang);assert.equal(url.searchParams.has('uid'),false);}
 assert.throws(()=>client.invitationLink('users/uid','da','https://circle.test'),/INVALID_INVITE_CODE/);
});
test('mobile sharing supports native share, cancellation and safe copy fallback',async()=>{
 const data={title:'Circle',text:'Invite',url:'https://circle.test/?invite='+code},copied=[];let shared=0;
 assert.equal(await client.shareInvitation(data,{share:async d=>{shared++;assert.deepEqual(d,data);},clipboard:{writeText:async t=>copied.push(t)}}),'shared');assert.equal(shared,1);assert.deepEqual(copied,[]);
 const cancel=Error('cancelled');cancel.name='AbortError';assert.equal(await client.shareInvitation(data,{share:async()=>{throw cancel;},clipboard:{writeText:async t=>copied.push(t)}}),'cancelled');assert.deepEqual(copied,[]);
 assert.equal(await client.shareInvitation(data,{clipboard:{writeText:async t=>copied.push(t)}}),'copied');assert.deepEqual(copied,[data.url]);
 assert.equal(await client.shareInvitation(data,{share:async()=>{throw Error('unsupported');},clipboard:{writeText:async()=>{}}}),'copied');
 await assert.rejects(()=>client.shareInvitation(data,{clipboard:{writeText:async()=>{throw Error('denied');}}}),/denied/);
});
function harness({fail=false,lookupFails=false}={}){
 const docs=new Map(),after=[],pushes=[];let version=0;
 const put=(path,fields)=>docs.set(path,{name:path,updateTime:String(++version),fields});
 const str=value=>({stringValue:value});
 put('users/inviter',{name:str('Neighbour'),inviteCode:str(code),subscriptionPlan:str('plus'),stripeSubscriptionId:str('preserved-subscription')});put('inviteCodes/'+code,{inviterUid:str('inviter')});
 const server={getFirestoreDocument:async path=>{if(lookupFails&&path.startsWith('inviteCodes/'))throw Error('private-error-marker');return structuredClone(docs.get(path)??null);},firestoreDocumentName:p=>p,serviceToken:async()=> 'test-only-token',
 verifyFirebaseRequest:async request=>{const uid=request.headers.get('authorization');if(!uid||uid==='guest')throw Error('Du skal være logget ind');return {localId:uid,email:uid+'@example.test',emailVerified:true,createdAt:String(Date.now()-1000)};},
 commitFirestoreWrites:async writes=>{if(fail)throw Error('SAVE_FAILED');for(const w of writes){const current=docs.get(w.update?.name);if(w.currentDocument?.exists===false&&current||w.currentDocument?.updateTime&&current?.updateTime!==w.currentDocument.updateTime)throw Error('IDENTITY_CONFLICT');}for(const w of writes){if(w.delete){docs.delete(w.delete);continue;}put(w.update.name,w.updateMask?{...docs.get(w.update.name)?.fields,...w.update.fields}:w.update.fields);}},
 getServerProfile:async()=>({name:'New neighbour',street:'Testvej',phone:'12345678',place:{id:'1'},country:'DK',subscriptionPlan:'free',createdAt:new Date().toISOString()}),firestoreDocumentUrl:p=>'https://circle.test/'+p,
 };
 const load=createTsLoader({'@/lib/firebase-server':server,'@/lib/server-config':{serverConfig:()=> 'unit-test-key-not-a-secret'},'next/server':{NextResponse:{json:(d,i)=>Response.json(d,i)},after:fn=>after.push(fn)},'@/lib/push-server':{notifyOwnersOfSignup:async uid=>pushes.push(uid)},'@/lib/search-alerts':{notifyListingMatches:async()=>{}}});
 globalThis.fetch=async(input,init)=>{assert.ok(String(input).includes(':runQuery'));const q=JSON.parse(init.body).structuredQuery;const rows=[...docs.values()].filter(d=>d.name.split('/')[0]===q.from[0].collectionId&&(!q.where||d.fields[q.where.fieldFilter.field.fieldPath]?.stringValue===q.where.fieldFilter.value.stringValue));return Response.json(rows.map(document=>({document})));};
 const profile=load('@/app/api/profile/route'),listing=load('@/app/api/listings/route');
 const body={name:'New neighbour',email:'newbie@example.test',phone:'12345678',street:'Testvej 1',place:{id:'1',country:'DK',postcode:'4174',city:'Jystrup'},invitationCode:code,invitationConsentVersion:client.INVITATION_CONSENT_VERSION,referredByUid:'attacker',subscriptionPlan:'plus',freeAccessStartedAt:'2099-01-01'};
 return {docs,put,server:load('@/lib/invitation-server'),profile,load,after,pushes,body,call:(data=body,uid='newbie')=>profile.POST(new Request('https://circle.test/api/profile',{method:'POST',headers:{authorization:uid},body:JSON.stringify(data)})),listingCall:(uid='newbie')=>listing.POST(new Request('https://circle.test/api/listings',{method:'POST',headers:{authorization:uid},body:JSON.stringify({listing:{id:'new_listing_12345678901234',name:'Havesaks',description:'Til haven',category:'garden',dailyPrice:0,photos:[],place:body.place}})}))};
}
test('concurrent code issuance creates one stable opaque code and preserves the inviter profile',async()=>{
 const h=harness();h.put('users/inviter',{name:{stringValue:'Neighbour'},subscriptionPlan:{stringValue:'plus'},stripeSubscriptionId:{stringValue:'sub_preserved'}});
 const codes=await Promise.all(Array.from({length:8},()=>h.server.getOrCreateInviteCode('inviter')));assert.equal(new Set(codes).size,1);assert.match(codes[0],/^[A-Za-z0-9_-]{16}$/);
 assert.equal(h.docs.get('users/inviter').fields.stripeSubscriptionId.stringValue,'sub_preserved');assert.equal(h.docs.get('users/inviter').fields.name.stringValue,'Neighbour');
 assert.equal(await h.server.getOrCreateInviteCode('inviter'),codes[0]);assert.equal(await h.server.lookupInviter(codes[0],'newbie'),'inviter');assert.equal(await h.server.lookupInviter(codes[0],'inviter'),null);assert.equal(await h.server.lookupInviter('a-fake-code','newbie'),null);
 h.docs.delete('users/inviter');assert.equal(await h.server.lookupInviter(codes[0],'newbie'),null);
});
test('verified signup and attribution commit atomically once without changing the free offer',async()=>{
 const h=harness();assert.equal((await h.call()).status,200);const signup=h.docs.get('inviteSignups/newbie');assert.equal(signup.fields.inviterUid.stringValue,'inviter');assert.equal(signup.fields.consentVersion.stringValue,client.INVITATION_CONSENT_VERSION);
 assert.equal(h.docs.get('users/newbie').fields.referredByUid.stringValue,'inviter');assert.equal(h.docs.get('users/newbie').fields.subscriptionPlan.stringValue,'free');assert.ok(Date.parse(h.docs.get('users/newbie').fields.freeAccessStartedAt.timestampValue)<Date.now());
 await h.after[0]();assert.deepEqual(h.pushes,['newbie']);const before=structuredClone(signup);assert.equal((await h.call({...h.body,invitationCode:'OtherCode1234567'})).status,200);assert.deepEqual(h.docs.get('inviteSignups/newbie'),before);assert.equal(h.after.length,1);
 assert.deepEqual(h.server.invitationMetrics(await h.server.invitationSignups('inviter')),{registrations:1,sharedAtLeastOnce:0});
});
test('concurrent profile submissions cannot double-credit an invitation or duplicate owner pushes',async()=>{
 const h=harness();const responses=await Promise.all([h.call(),h.call({...h.body,phone:'87654321'})]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal(h.after.length,1);assert.equal([...h.docs.keys()].filter(p=>p.startsWith('inviteSignups/')).length,1);
});
test('missing consent, unknown invitations and forged attribution never credit an inviter',async()=>{
 for(const data of [{invitationConsentVersion:undefined},{invitationConsentVersion:'wrong-version'},{invitationCode:'unknowncode12345'},{invitationCode:'users/inviter'}]){const h=harness();assert.equal((await h.call({...h.body,...data})).status,200);assert.equal(h.docs.has('inviteSignups/newbie'),false);assert.equal(h.docs.get('users/newbie').fields.referredByUid,undefined);}
 const existing=harness();existing.put('users/newbie',{name:{stringValue:'Existing'},createdAt:{timestampValue:'2020-01-01T00:00:00Z'},subscriptionPlan:{stringValue:'plus'},stripeSubscriptionId:{stringValue:'sub_existing'}});assert.equal((await existing.call()).status,200);assert.equal(existing.docs.has('inviteSignups/newbie'),false);assert.equal(existing.docs.get('users/newbie').fields.stripeSubscriptionId.stringValue,'sub_existing');
});
test('failed or unauthenticated profile creation credits nobody; an unavailable optional lookup does not block signup',async()=>{
 const failed=harness({fail:true});assert.equal((await failed.call()).status,500);assert.equal(failed.docs.has('users/newbie'),false);assert.equal(failed.docs.has('inviteSignups/newbie'),false);assert.equal(failed.after.length,0);
 const guest=harness();assert.equal((await guest.call(guest.body,'guest')).status,401);assert.equal(guest.docs.has('inviteSignups/newbie'),false);
 const offline=harness({lookupFails:true});assert.equal((await offline.call()).status,200);assert.equal(offline.docs.has('inviteSignups/newbie'),false);
});
test('first active listing counts a person once; edits retry optional tracking without blocking the listing',async()=>{
 const h=harness();await h.call();h.after.length=0;assert.equal((await h.listingCall()).status,200);for(const fn of h.after)await fn();const first=h.docs.get('inviteSignups/newbie').fields.firstListingAt.timestampValue;assert.ok(first);
 h.after.length=0;assert.equal((await h.listingCall()).status,200);for(const fn of h.after)await fn();assert.equal(h.docs.get('inviteSignups/newbie').fields.firstListingAt.timestampValue,first);assert.deepEqual(h.server.invitationMetrics(await h.server.invitationSignups('inviter')),{registrations:1,sharedAtLeastOnce:1});
 const other=harness();other.put('listings/new_listing_12345678901234',{ownerUid:{stringValue:'someone-else'},active:{booleanValue:true}});assert.equal((await other.listingCall()).status,403);assert.equal(other.after.length,0);
});
test('statistics are scoped to the authenticated inviter; only allowlisted owners can see totals',async()=>{
 const h=harness();await h.call();process.env.CIRCLE_MAP_OWNER_UIDS='owner';process.env.CIRCLE_MAP_OWNER_EMAILS='';
 const own=h.load('@/app/api/invitations/route'),admin=h.load('@/app/api/invitations/admin/route');
 const request=uid=>new Request('https://circle.test/api/invitations?uid=inviter&admin=true',{headers:{authorization:uid}});
 assert.equal((await own.GET(request('guest'))).status,401);assert.equal((await admin.GET(request('guest'))).status,401);assert.equal((await admin.GET(request('newbie'))).status,403);
 const a=await own.GET(request('newbie'));assert.equal(a.status,200);assert.equal((await a.json()).registrations,0);const b=await own.GET(request('inviter'));assert.equal((await b.json()).registrations,1);
 const totals=await admin.GET(request('owner'));assert.equal(totals.status,200);assert.deepEqual(await totals.json(),{registrations:1,sharedAtLeastOnce:0});assert.match(totals.headers.get('cache-control'),/no-store/);
});
test('invitation API errors do not leak Firestore diagnostics',async()=>{
 const load=createTsLoader({'next/server':{NextResponse:{json:(d,i)=>Response.json(d,i)}},'@/lib/firebase-server':{verifyFirebaseRequest:async()=>({localId:'owner',email:'owner@example.test',emailVerified:true})},'@/lib/invitation-server':{getOrCreateInviteCode:async()=>{throw Error('private-error-marker');},invitationSignups:async()=>[],invitationMetrics:()=>({})}});
 const response=await load('@/app/api/invitations/route').GET(new Request('https://circle.test/api/invitations'));assert.equal(response.status,500);assert.deepEqual(await response.json(),{error:'INVITATIONS_UNAVAILABLE'});
});
test('client submits only a consenting pending invitation and clears it only after a successful profile save',async()=>{
 const s=storage();globalThis.window={localStorage:s};client.rememberInviteFromUrl('https://circle.test/?invite='+code,s);const requests=[];let ok=false;
 globalThis.fetch=async(url,init)=>{requests.push(JSON.parse(init.body));return Response.json(ok?{}:{error:'Rejected'},{status:ok?200:400});};
 const {saveCircleProfile}=createTsLoader({'@/lib/firebase-client':{db:null},'firebase/auth':{updateProfile:async()=>{}}})('@/lib/firebase-profile');
 const user={displayName:'Member',getIdToken:async()=> 'local-test-token'},profile={name:'Member'};
 await assert.rejects(()=>saveCircleProfile(user,profile,'sv'),/Rejected/);assert.equal(client.pendingInvite(s),code);ok=true;await saveCircleProfile(user,profile,'sv');assert.equal(requests.at(-1).invitationCode,code);assert.equal(requests.at(-1).invitationConsentVersion,client.INVITATION_CONSENT_VERSION);assert.equal(client.pendingInvite(s),undefined);
 await saveCircleProfile(user,profile,'sv');assert.equal(requests.at(-1).invitationCode,undefined);assert.equal(requests.at(-1).invitationConsentVersion,undefined);
});
test('invitation collections remain server private',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');for(const name of ['inviteCodes','inviteSignups'])assert.match(rules,new RegExp('match /'+name+'/\\{[^}]+\\} \\{ allow read, write: if false; \\}'));
});
