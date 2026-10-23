import {getFirestoreDocument} from "@/lib/firebase-server";
import {decodeFields} from "@/lib/firestore-values";
import {queryRecords} from "@/lib/community-server";
import {publishableIds} from "@/lib/listing-access";
import {storedCountry} from "@/lib/region";
import type {Json} from "@/lib/firestore-values";
import {publicOwnerArea} from "@/lib/public-owner-area";
import {publicProfilePhotoUrl} from "@/lib/profile-photo";
import {serverConfig} from "@/lib/server-config";

const headers={"cache-control":"no-store"};
export async function GET(request:Request) {
  const uid=new URL(request.url).searchParams.get("ownerUid")??"";
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(uid))return Response.json({error:"INVALID_OWNER"},{status:400,headers});
  try {
    const doc=await getFirestoreDocument(`users/${uid}`);
    if(!doc)return Response.json({error:"OWNER_NOT_FOUND"},{status:404,headers});
    const profile=decodeFields(doc.fields??{});
    const place=profile.place&&typeof profile.place==="object"&&!Array.isArray(profile.place)?profile.place:{};
    const name=String(profile.name??"").trim().split(/\s+/)[0]||"Circle";
    const photoUrl=publicProfilePhotoUrl(uid,profile.profilePhoto,serverConfig("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"));
    const owned=(await queryRecords("listings","ownerUid",uid)).filter(l=>l.active===true&&l.ownerUid===uid);
    const published=publishableIds(owned.map(l=>({...l,id:String(l.id)})),{
      subscriptionPlan:String(profile.subscriptionPlan??"free"),
      createdAt:typeof profile.createdAt==="string"?profile.createdAt:doc.createTime,
      freeAccessStartedAt:typeof profile.freeAccessStartedAt==="string"?profile.freeAccessStartedAt:undefined,
    });
    // Explicit public allowlist: contact, billing and agreement data stay private.
    const fields=["description","category","country","city","dailyPrice","deposit","active","details","createdAt"];
    const listings=owned.filter(l=>published.has(String(l.id))).map(l=>{
      const itemPlace=l.place&&typeof l.place==="object"&&!Array.isArray(l.place)?l.place:{};
      const photos=Array.isArray(l.photos)?l.photos.filter((p):p is {[key:string]:Json}=>p!==null&&typeof p==="object"&&!Array.isArray(p)).slice(0,2).map(p=>Object.fromEntries(["src","name","bytes","width","height","storagePath"].filter(k=>p[k]!==undefined).map(k=>[k,p[k]]))):[];
      return {...Object.fromEntries(fields.filter(k=>l[k]!==undefined).map(k=>[k,l[k]])),id:String(l.id),name:String(l.name??""),place:Object.fromEntries(["id","country","city","postcode","lat","lon"].filter(k=>itemPlace[k]!==undefined).map(k=>[k,itemPlace[k]])),photos,ownerUid:uid,owner:name,publishable:true};
    });
    listings.sort((a,b)=>String(a.name).localeCompare(String(b.name))||String(a.id).localeCompare(String(b.id)));
    return Response.json({owner:{uid,name,city:typeof place.city==="string"?place.city:"",country:storedCountry(typeof place.country==="string"?place.country:undefined),area:publicOwnerArea(place),...(photoUrl?{photoUrl}:{})},listings},{headers});
  }catch{return Response.json({error:"OWNER_UNAVAILABLE"},{status:503,headers});}
}
