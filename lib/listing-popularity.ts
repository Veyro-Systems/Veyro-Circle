import {getFirestoreDocument,serviceToken} from "@/lib/firebase-server";
import {serverConfig} from "@/lib/server-config";
import {decodeFields,type Value} from "@/lib/firestore-values";
import {agreementStage,type WorkflowAgreement} from "@/lib/agreement-workflow";

export type ListingRating={average:number;count:number;popular:boolean};
type Item={id:string;ownerUid:string};
type Review=Record<string,unknown>;
// Equal top averages share the badge. Unreviewed items never receive one.
export function rankListingReviews(items:Item[],reviews:Review[]):Record<string,ListingRating>{
 const owners=new Map(items.map(item=>[item.id,item.ownerUid])),totals=new Map<string,{sum:number;count:number}>(),seen=new Set<string>();
 for(const review of reviews){
  const {listingId,subjectUid,subjectRole,authorUid,agreementId}=review,stars=Number(review.stars),scale=Number(review.maxStars??5);
  if(typeof listingId!=="string"||owners.get(listingId)!==subjectUid||subjectRole!=="lender"||typeof authorUid!=="string"||!authorUid||authorUid===subjectUid||typeof agreementId!=="string"||!agreementId||![5,6].includes(scale)||!Number.isInteger(stars)||stars<1||stars>scale)continue;
  const key=`${agreementId}:${authorUid}`;if(seen.has(key))continue;seen.add(key);
  const total=totals.get(listingId)??{sum:0,count:0};total.sum+=stars*6/scale;total.count++;totals.set(listingId,total);
 }
 const best=Math.max(0,...[...totals.values()].map(total=>total.sum/total.count));
 return Object.fromEntries([...totals].map(([id,total])=>{const average=total.sum/total.count;return [id,{average,count:total.count,popular:Math.abs(average-best)<1e-9}];}));
}

export async function listingPopularity(items:Item[]):Promise<Record<string,ListingRating>>{
 if(!items.length)return {};
 try{
  const project=encodeURIComponent(serverConfig("NEXT_PUBLIC_FIREBASE_PROJECT_ID")),token=await serviceToken(),reviews:Review[]=[];
  // Firestore supports up to 30 values in an IN filter. No contact data or review text is fetched.
  for(let offset=0;offset<items.length;offset+=30){
   const response=await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery`,{method:"POST",cache:"no-store",signal:AbortSignal.timeout(8000),headers:{authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify({structuredQuery:{select:{fields:["listingId","subjectUid","subjectRole","authorUid","agreementId","stars","maxStars"].map(fieldPath=>({fieldPath}))},from:[{collectionId:"reviews"}],where:{fieldFilter:{field:{fieldPath:"listingId"},op:"IN",value:{arrayValue:{values:items.slice(offset,offset+30).map(item=>({stringValue:item.id}))}}}}}})});
   if(!response.ok)throw Error();
   const rows=await response.json() as Array<{document?:{fields?:Record<string,Value>}}>;
   for(const row of rows)if(row.document)reviews.push(decodeFields(row.document.fields));
  }
  // Older records predate subjectRole. Validate those against the completed agreement.
  const legacy=new Map<string,Review|null>();
  for(const review of reviews){
   if(review.subjectRole!==undefined||typeof review.agreementId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(review.agreementId))continue;
   if(!legacy.has(review.agreementId)){const doc=await getFirestoreDocument(`agreements/${review.agreementId}`);legacy.set(review.agreementId,doc?decodeFields(doc.fields):null);}
   const agreement=legacy.get(review.agreementId);
   if(agreement&&agreementStage(agreement as unknown as WorkflowAgreement)==="returned"&&agreement.lenderUid===review.subjectUid&&agreement.borrowerUid===review.authorUid&&(agreement.item as Record<string,unknown>)?.id===review.listingId)review.subjectRole="lender";
  }
  // Current lender reviews are server-created only after both parties finish the return.
  return rankListingReviews(items,reviews);
 }catch{return {};}// Reviews being unavailable must not hide otherwise available listings.
}
