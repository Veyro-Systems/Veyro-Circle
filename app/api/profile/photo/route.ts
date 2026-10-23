import sharp from "sharp";
import {commitFirestoreWrites,firestoreDocumentName,getFirestoreDocument,verifyFirebaseRequest} from "@/lib/firebase-server";
import {serverConfig} from "@/lib/server-config";
import {deleteProfilePhoto,putProfilePhoto} from "@/lib/profile-photo-storage";
import {isOwnProfilePhotoPath,publicProfilePhotoUrl} from "@/lib/profile-photo";
export const runtime="nodejs";
const headers={"cache-control":"private, no-store",Vary:"Authorization"},maximumBytes=1024*1024;
class PhotoError extends Error {constructor(public status:number,public code:string){super(code);}}
function failure(cause:unknown){return Response.json({error:cause instanceof PhotoError?cause.code:cause instanceof Error&&cause.message==="IDENTITY_CONFLICT"?"PROFILE_PHOTO_CONFLICT":"PROFILE_PHOTO_FAILED"},{status:cause instanceof PhotoError?cause.status:cause instanceof Error&&cause.message==="IDENTITY_CONFLICT"?409:503,headers});}
async function context(request:Request){
 let uid:string;try{uid=(await verifyFirebaseRequest(request)).localId;}catch{throw new PhotoError(401,"AUTH_REQUIRED");}
 const doc=await getFirestoreDocument(`users/${uid}`);if(!doc?.fields?.name?.stringValue)throw new PhotoError(404,"PROFILE_REQUIRED");
 const photo=doc.fields.profilePhoto?.mapValue?.fields;
 return {uid,doc,path:photo?.storagePath?.stringValue,photoUrl:publicProfilePhotoUrl(uid,{src:photo?.src?.stringValue,storagePath:photo?.storagePath?.stringValue},serverConfig("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"))};
}
async function bodyBytes(request:Request){
 if(request.headers.get("content-type")?.split(";")[0]!=="image/jpeg")throw new PhotoError(400,"PROFILE_PHOTO_FORMAT");
 if(Number(request.headers.get("content-length"))>maximumBytes)throw new PhotoError(413,"PROFILE_PHOTO_SIZE");
 const reader=request.body?.getReader();if(!reader)throw new PhotoError(400,"PROFILE_PHOTO_FORMAT");const chunks:Uint8Array[]=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximumBytes){await reader.cancel();throw new PhotoError(413,"PROFILE_PHOTO_SIZE");}chunks.push(value);}
 return Buffer.concat(chunks);
}
export async function GET(request:Request){try{return Response.json({photoUrl:(await context(request)).photoUrl??null},{headers});}catch(cause){return failure(cause);}}
export async function POST(request:Request){
 try {
  const c=await context(request),bytes=await bodyBytes(request);let image:Buffer;
  try{const info=await sharp(bytes,{limitInputPixels:1600*1600,failOn:"warning"}).metadata();if(info.format!=="jpeg"||!info.width||!info.height)throw Error();image=await sharp(bytes,{limitInputPixels:1600*1600,failOn:"warning"}).rotate().resize(512,512,{fit:"cover"}).jpeg({quality:85}).toBuffer();}catch{throw new PhotoError(400,"PROFILE_PHOTO_FORMAT");}
  const path=`profile-photos/${c.uid}/${crypto.randomUUID()}.jpg`,src=await putProfilePhoto(path,image);
  try{await commitFirestoreWrites([{update:{name:firestoreDocumentName(`users/${c.uid}`),fields:{profilePhoto:{mapValue:{fields:{src:{stringValue:src},storagePath:{stringValue:path}}}}}},updateMask:{fieldPaths:["profilePhoto"]},currentDocument:{updateTime:c.doc.updateTime}}]);}
  catch(cause){try{await deleteProfilePhoto(path);}catch{console.warn("Circle unused profile photo cleanup unavailable");}throw cause;}
  if(isOwnProfilePhotoPath(c.uid,c.path))try{await deleteProfilePhoto(c.path);}catch{console.warn("Circle replaced profile photo cleanup unavailable");}
  return Response.json({photoUrl:src},{headers});
 }catch(cause){return failure(cause);}
}
export async function DELETE(request:Request){
 try{const c=await context(request);if(isOwnProfilePhotoPath(c.uid,c.path))await deleteProfilePhoto(c.path);await commitFirestoreWrites([{update:{name:firestoreDocumentName(`users/${c.uid}`),fields:{}},updateMask:{fieldPaths:["profilePhoto"]},currentDocument:{updateTime:c.doc.updateTime}}]);return Response.json({photoUrl:null},{headers});}catch(cause){return failure(cause);}
}
