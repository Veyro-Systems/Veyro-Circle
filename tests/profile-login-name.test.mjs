import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const originalFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=originalFetch;});
function setup({ok=true,nameFails=false}={}){
 const names=[],requests=[];
 globalThis.fetch=async(url,init)=>{requests.push({url,body:JSON.parse(init.body)});return Response.json(ok?{}:{error:'Invalid profile'},{status:ok?200:400});};
 const {saveCircleProfile}=createTsLoader({'@/lib/firebase-client':{db:null},'firebase/auth':{updateProfile:async(user,fields)=>{names.push(fields);if(nameFails)throw Error('Network failed');}}})('@/lib/firebase-profile');
 const user={displayName:'Peter',getIdToken:async()=> 'test-only-token'};
 return {names,requests,save:(name='Jørn')=>saveCircleProfile(user,{name},'da')};
}
test('an accepted Circle name updates the authentication mail name without changing other auth fields',async()=>{
 const s=setup();assert.equal(await s.save(),true);assert.deepEqual(s.names,[{displayName:'Jørn'}]);assert.equal(s.requests.length,1);assert.equal(s.requests[0].body.name,'Jørn');
});
test('a rejected profile never updates the login name',async()=>{
 const s=setup({ok:false});await assert.rejects(s.save(),/Invalid profile/);assert.deepEqual(s.names,[]);
});
test('a name-sync failure is distinguished from losing a successfully saved profile',async()=>{
 const s=setup({nameFails:true});assert.equal(await s.save(),false);assert.equal(s.requests.length,1);assert.deepEqual(s.names,[{displayName:'Jørn'}]);
});
