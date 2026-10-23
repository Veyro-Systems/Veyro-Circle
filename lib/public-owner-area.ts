import {places,normalizePlace,type Country} from "./marketplace";

export type PublicOwnerArea={country:Country;postcode:string;city:string;lat:number;lon:number};
const byPostcode=new Map<string,typeof places>();
for(const place of places){const key=`${place.country}:${place.postcode}`;const group=byPostcode.get(key)??[];group.push(place);byPostcode.set(key,group);}

// Publish the postal catalogue's centre, never coordinates supplied in a profile.
export function publicOwnerArea(value:unknown):PublicOwnerArea|null {
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const place=value as Record<string,unknown>;
  if(typeof place.postcode!=="string"||typeof place.country!=="string")return null;
  const matches=byPostcode.get(`${place.country}:${place.postcode.trim()}`)??[];
  const known=matches.find(item=>typeof place.city==="string"&&normalizePlace(item.city)===normalizePlace(place.city))||(matches.length===1?matches[0]:undefined);
  return known?{country:known.country,postcode:known.postcode,city:known.city,lat:known.lat,lon:known.lon}:null;
}
