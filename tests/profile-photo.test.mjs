import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createTsLoader} from './load-typescript.mjs';
const bucket='test-bucket',oldPath='profile-photos/self/11111111-1111-4111-8111-111111111111.jpg';
const photoUrl=path=>`https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=22222222-2222-4222-8222-222222222222`;
const originalFields={uid:{stringValue:'self'},name:{stringValue:'Member'},email:{stringValue:'member@example.test'},subscriptionPlan:{stringValue:'plus'},stripeSubscriptionId:{stringValue:'sub_preserved'},freeAccessStartedAt:{timestampValue:'2026-10-01T00:00:00Z'},profilePhoto:{mapValue:{fields:{src:{stringValue:photoUrl(oldPath)},storagePath:{stringValue:oldPath}}}}};
function setup({conflict=false,storageFails=false,missing=false,foreignPath=false}={}){
 let doc=missing?null:{fields:structuredClone(originalFields),updateTime:'v1'};const writes=[],uploads=[],removed=[];
 if(foreignPath)doc.fields.profilePhoto.mapValue.fields.storagePath.stringValue='profile-photos/other/11111111-1111-4111-8111-111111111111.jpg';
 const load=createTsLoader({'@/lib/server-config':{serverConfig:()=> bucket},'@/lib/firebase-server':{verifyFirebaseRequest:async request=>{if(request.headers.get('authorization')!=='verified')throw Error('AUTH');return {localId:'self'};},getFirestoreDocument:async path=>{assert.equal(path,'users/self');return structuredClone(doc);},firestoreDocumentName:p=>p,commitFirestoreWrites:async batch=>{if(conflict)throw Error('IDENTITY_CONFLICT');for(const w of batch){assert.equal(w.update.name,'users/self');assert.deepEqual(w.currentDocument,{updateTime:'v1'});assert.deepEqual(w.updateMask.fieldPaths,['profilePhoto']);writes.push(w);if(w.update.fields.profilePhoto)doc.fields.profilePhoto=w.update.fields.profilePhoto;else delete doc.fields.profilePhoto;}}},'@/lib/profile-photo-storage':{putProfilePhoto:async(path,bytes)=>{if(storageFails)throw Error('private-error-marker');uploads.push({path,bytes});return photoUrl(path);},deleteProfilePhoto:async path=>removed.push(path)}});
 const route=load('@/app/api/profile/photo/route');
 const request=(method,body,headers={})=>new Request('https://circle.test/api/profile/photo?uid=other&storagePath=foreign',{method,headers:{authorization:'verified',...(body?{'content-type':'image/jpeg'}:{}),...headers},...(body?{body:new Uint8Array(body)}:{})});
 return {route,load,writes,uploads,removed,doc:()=>doc,request};
}
const jpeg=await sharp({create:{width:640,height:480,channels:3,background:'#0095a5'}}).withMetadata({exif:{IFD0:{Artist:'Private EXIF marker'}}}).jpeg().toBuffer();
test('profile photo upload decodes and crops the image, strips metadata and preserves all other profile fields',async()=>{
 const s=setup();const response=await s.route.POST(s.request('POST',jpeg));assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);const data=await response.json();
 assert.equal(s.uploads.length,1);assert.ok(s.uploads[0].path.startsWith('profile-photos/self/'));const image=await sharp(s.uploads[0].bytes).metadata();assert.equal(image.width,512);assert.equal(image.height,512);assert.equal(image.format,'jpeg');assert.equal(image.exif,undefined);
 assert.equal(data.photoUrl,photoUrl(s.uploads[0].path));assert.deepEqual(s.removed,[oldPath]);for(const key of Object.keys(originalFields).filter(k=>k!=='profilePhoto'))assert.deepEqual(s.doc().fields[key],originalFields[key]);
});
test('unauthenticated, missing-profile, invalid and oversized photos are rejected without writes',async()=>{
 const s=setup();assert.equal((await s.route.POST(s.request('POST',jpeg,{authorization:'guest'}))).status,401);assert.equal((await s.route.GET(s.request('GET',null,{authorization:'guest'}))).status,401);
 assert.equal((await s.route.POST(s.request('POST',jpeg,{'content-type':'image/svg+xml'}))).status,400);assert.equal((await s.route.POST(s.request('POST',Buffer.from('not an image')))).status,400);
 const png=await sharp(jpeg).png().toBuffer();assert.equal((await s.route.POST(s.request('POST',png))).status,400);assert.equal((await s.route.POST(s.request('POST',Buffer.alloc(1024*1024+1)))).status,413);
 const missing=setup({missing:true});assert.equal((await missing.route.POST(missing.request('POST',jpeg))).status,404);assert.equal(s.uploads.length,0);assert.equal(s.writes.length,0);assert.equal(s.removed.length,0);
});
test('a failed profile update removes only its new upload and keeps the existing photo',async()=>{
 const s=setup({conflict:true});const r=await s.route.POST(s.request('POST',jpeg));assert.equal(r.status,409);assert.deepEqual(s.removed,[s.uploads[0].path]);assert.equal(s.doc().fields.profilePhoto.mapValue.fields.storagePath.stringValue,oldPath);
 const unavailable=setup({storageFails:true});const failure=await unavailable.route.POST(unavailable.request('POST',jpeg));assert.equal(failure.status,503);assert.doesNotMatch(await failure.text(),/private-error-marker/);assert.equal(unavailable.writes.length,0);
});
test('removing a photo affects only the authenticated profile and never deletes another owner path',async()=>{
 const s=setup();assert.equal((await s.route.DELETE(s.request('DELETE'))).status,200);assert.deepEqual(s.removed,[oldPath]);assert.equal(s.doc().fields.profilePhoto,undefined);for(const key of Object.keys(originalFields).filter(k=>k!=='profilePhoto'))assert.deepEqual(s.doc().fields[key],originalFields[key]);
 const foreign=setup({foreignPath:true});assert.equal((await foreign.route.DELETE(foreign.request('DELETE'))).status,200);assert.deepEqual(foreign.removed,[]);
});
test('public photo URL validation rejects foreign owners, private evidence and arbitrary image hosts',()=>{
 const {publicProfilePhotoUrl}=createTsLoader()('@/lib/profile-photo');assert.equal(publicProfilePhotoUrl('self',{src:photoUrl(oldPath),storagePath:oldPath},bucket),photoUrl(oldPath));
 for(const photo of [{src:photoUrl(oldPath),storagePath:oldPath.replace('/self/','/other/')},{src:'https://example.test/track',storagePath:oldPath},{src:photoUrl(oldPath).replace(bucket,'foreign-bucket'),storagePath:oldPath},{src:photoUrl(oldPath),storagePath:'agreement-evidence/private/photo.jpg'}])assert.equal(publicProfilePhotoUrl('self',photo,bucket),undefined);
});
test('public owner profiles expose only the approved photo URL, without contact or storage metadata',async()=>{
 const s=setup();const route=createTsLoader({'@/lib/server-config':{serverConfig:()=>bucket},'@/lib/firebase-server':{getFirestoreDocument:async()=>s.doc()},'@/lib/community-server':{queryRecords:async()=>[]}})('@/app/api/owner-profile/route');
 const response=await route.GET(new Request('https://circle.test/api/owner-profile?ownerUid=self'));assert.equal(response.status,200);const data=await response.json();assert.equal(data.owner.photoUrl,photoUrl(oldPath));assert.doesNotMatch(JSON.stringify(data),/member@example|sub_preserved|storagePath|freeAccessStartedAt/);
});
