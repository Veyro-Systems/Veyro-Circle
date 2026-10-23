import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const path='profile-photos/owner/11111111-1111-4111-8111-111111111111.jpg',src=`https://firebasestorage.googleapis.com/v0/b/test-bucket/o/${encodeURIComponent(path)}?alt=media&token=22222222-2222-4222-8222-222222222222`;
for(const valid of [true,false])test(`listing feed derives owner photo from validated profile (valid=${valid})`,async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>Response.json([{document:{name:'listings/item',fields:{ownerUid:{stringValue:'owner'},ownerPhotoUrl:{stringValue:'https://untrusted.test/image'},active:{booleanValue:true}}}}]);
 try{const route=createTsLoader({'@/lib/server-config':{serverConfig:()=> 'test-bucket'},'@/lib/firebase-server':{serviceToken:async()=> 'test-only',getFirestoreDocument:async()=>({fields:{profilePhoto:{mapValue:{fields:{src:{stringValue:src},storagePath:{stringValue:valid?path:path.replace('/owner/','/other/')}}}},email:{stringValue:'private@example.test'}}})},'@/lib/listing-access':{publishableIds:()=>['item']},'@/lib/listing-popularity':{listingPopularity:async()=>({})}})('@/app/api/listings/feed/route');const response=await route.GET(new Request('https://circle.test/api/listings/feed'));assert.equal(response.status,200);const data=await response.json();assert.equal(data.listings[0].ownerPhotoUrl,valid?src:undefined);assert.doesNotMatch(JSON.stringify(data),/untrusted|private@example|storagePath/);}finally{globalThis.fetch=original;}
});
