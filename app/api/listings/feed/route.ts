import {verifyFirebaseRequest,getFirestoreDocument,serviceToken} from "@/lib/firebase-server";
import {serverConfig} from "@/lib/server-config";
import {decodeFields,type Value} from "@/lib/firestore-values";
import {publishableIds} from "@/lib/listing-access";
import {listingPopularity} from "@/lib/listing-popularity";
import {publicProfilePhotoUrl} from "@/lib/profile-photo";
const headers={"cache-control":"private, no-store"};
export async function GET(request:Request) {
  let uid="";
  if(request.headers.has("authorization")){try{uid=(await verifyFirebaseRequest(request)).localId;}catch{return Response.json({error:"AUTH_REQUIRED"},{status:401,headers});}}
  try {
    const project=encodeURIComponent(serverConfig("NEXT_PUBLIC_FIREBASE_PROJECT_ID"));
    const response=await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery`,{method:"POST",cache:"no-store",headers:{authorization:`Bearer ${await serviceToken()}`,"content-type":"application/json"},body:JSON.stringify({structuredQuery:{from:[{collectionId:"listings"}],where:{fieldFilter:{field:{fieldPath:"active"},op:"EQUAL",value:{booleanValue:true}}}}})});
    if(!response.ok)throw Error();
    const rows=await response.json() as Array<{document?:{name:string;fields:Record<string,Value>}}>;
    const listings=rows.flatMap(r=>r.document?[{id:r.document.name.split("/").pop()!,data:decodeFields(r.document.fields)}]:[]);
    const owners=[...new Set(listings.map(l=>String(l.data.ownerUid)))];
    const published=new Set<string>(),ownerPhotos=new Map<string,string>();
    await Promise.all(owners.map(async owner=>{
      const doc=await getFirestoreDocument(`users/${owner}`);
      if(!doc)return;
      const profile=decodeFields(doc.fields??{});
      const photo=publicProfilePhotoUrl(owner,profile.profilePhoto,serverConfig("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"));if(photo)ownerPhotos.set(owner,photo);
      const ids=publishableIds(listings.filter(l=>l.data.ownerUid===owner).map(l=>({...l.data,id:l.id})),{subscriptionPlan:String(profile.subscriptionPlan??"free"),createdAt:typeof profile.createdAt==="string"?profile.createdAt:doc.createTime,freeAccessStartedAt:typeof profile.freeAccessStartedAt==="string"?profile.freeAccessStartedAt:undefined});
      for(const id of ids)published.add(id);
    }));
    const fields=["ownerUid","owner","name","description","category","subcategory","country","city","place","dailyPrice","deposit","photos","active","details","createdAt"];
    const ratings=await listingPopularity(listings.filter(l=>published.has(l.id)).map(l=>({id:l.id,ownerUid:String(l.data.ownerUid)})));
    return Response.json({listings:listings.filter(l=>published.has(l.id)||l.data.ownerUid===uid).map(l=>({id:l.id,...Object.fromEntries(fields.filter(k=>l.data[k]!==undefined).map(k=>[k,l.data[k]])),publishable:published.has(l.id),...(ownerPhotos.has(String(l.data.ownerUid))?{ownerPhotoUrl:ownerPhotos.get(String(l.data.ownerUid))}:{}),...(ratings[l.id]?{reviewRating:ratings[l.id]}:{})}))},{headers});
  }catch{return Response.json({error:"LISTINGS_UNAVAILABLE"},{status:503,headers});}
}
