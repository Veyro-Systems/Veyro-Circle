import { circleAccess, type AccessProfile } from "./circle-access";
import { queryRecords } from "./community-server";

export function publishableIds(listings:Array<{id:string;active?:unknown;createdAt?:unknown}>,profile:AccessProfile) {
  const limit=circleAccess(profile).listingLimit;
  return new Set(listings.filter(l=>l.active!==false).sort((a,b)=>String(a.createdAt??"").localeCompare(String(b.createdAt??""))||a.id.localeCompare(b.id)).slice(0,limit).map(l=>l.id));
}
export async function listingIsPublishable(id:string,ownerUid:string,profile:AccessProfile) {
  const access=circleAccess(profile);
  if(!access.canUseApp)return false;
  const listings=await queryRecords("listings","ownerUid",ownerUid);
  return publishableIds(listings.map(l=>({...l,id:String(l.id)})),profile).has(id);
}
