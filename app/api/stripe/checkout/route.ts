import { verifyFirebaseRequest, getServerProfile, getFirestoreDocument, commitFirestoreWrites, firestoreDocumentName } from "@/lib/firebase-server";
import { serverConfig } from "@/lib/server-config";
import { stripeRequest } from "@/lib/stripe-server";
import { billingContext } from "@/lib/circle-billing";
import { circlePlusOffer,PLUS_OFFER_VERSION } from "@/lib/circle-plus-copy";
import { regions, isLang } from "@/lib/region";
import {circleAccess} from "@/lib/circle-access";

const headers={"cache-control":"private, no-store"};
export async function GET(request:Request) {
  try {
    const user=await verifyFirebaseRequest(request);
    const profile=await getServerProfile(user.localId);
    // Permanent free access is not a Stripe subscription. Signing up
    // must keep working without any Stripe customer, session or API request.
    const access=circleAccess(profile);
    const hasSubscription=profile.subscriptionPlan==="plus" || ["past_due","unpaid","paused","incomplete"].includes(profile.subscriptionStatus);
    return Response.json({trialEligible:false,hasSubscription,country:profile.country,access},{headers});
  }catch{return Response.json({error:"Din adgang kunne ikke kontrolleres. Prøv igen."},{status:503,headers});}
}

export async function POST(request: Request) {
  let lockPath="",attemptId="";
  let sessionFields:Record<string,{stringValue?:string;timestampValue?:string;booleanValue?:boolean}>={};
  try {
    const user = await verifyFirebaseRequest(request);
    const profile = await getServerProfile(user.localId);
    if (profile.subscriptionPlan === "plus") throw new Error("Du har allerede Circle Plus");
    const accepted=await request.json().catch(()=>null) as {expectedTrialEligible?:unknown;expectedCountry?:unknown;expectedOfferVersion?:unknown;lang?:unknown}|null;
    if(accepted?.expectedOfferVersion!==PLUS_OFFER_VERSION || accepted.expectedTrialEligible!==false || accepted.expectedCountry!==profile.country)return Response.json({code:"BILLING_OFFER_CHANGED",error:"Tilbuddet har ændret sig. Genindlæs siden og gennemgå den frivillige Plus-opgradering, før du fortsætter."},{status:409,headers});
    const path=`billingCheckouts/${user.localId}`;
    const previous=await getFirestoreDocument(path);
    if(Date.parse(previous?.fields?.busyUntil?.timestampValue ?? "")>Date.now())return Response.json({error:"En tilmelding behandles allerede. Prøv igen om lidt."},{status:409,headers});
    attemptId=(previous?.fields?.offerVersion?.stringValue===String(PLUS_OFFER_VERSION) && !previous?.fields?.sessionId?.stringValue && previous?.fields?.attemptId?.stringValue) || crypto.randomUUID();
    await commitFirestoreWrites([{update:{name:firestoreDocumentName(path),fields:{...previous?.fields,attemptId:{stringValue:attemptId},busyUntil:{timestampValue:new Date(Date.now()+300_000).toISOString()}}},currentDocument:previous?{updateTime:previous.updateTime}:{exists:false}}]);
    lockPath=path;
    const context=await billingContext(user.localId,user.email,profile);
    if(context.blocking)throw Error("Der findes allerede et abonnement. Administrer det fra din konto.");
    const lang=isLang(accepted.lang) ? accepted.lang : regions[profile.country].lang;
    const oldSessionId=previous?.fields?.sessionId?.stringValue;
    if(oldSessionId){
      const old=await stripeRequest(`/checkout/sessions/${encodeURIComponent(oldSessionId)}`);
      if(old.status==="open"){
        if(old.customer===context.customerId && old.currency===regions[profile.country].currency.toLowerCase() && old.locale===lang && previous?.fields?.offerVersion?.stringValue===String(PLUS_OFFER_VERSION) && previous.fields.priceId?.stringValue===serverConfig(regions[profile.country].priceKey))return Response.json({url:old.url},{headers});
        await stripeRequest(`/checkout/sessions/${encodeURIComponent(oldSessionId)}/expire`,new URLSearchParams());
      }
    }
    let customerId=context.customerId;
    if(!customerId){
      const customer=await stripeRequest("/customers",new URLSearchParams({email:user.email,"metadata[uid]":user.localId}),`circle-plus-customer:${user.localId}`);
      customerId=String(customer.id);
    }
    const origin = new URL(request.url).origin;
    // Persist a pending attempt before Stripe: a lost response must reuse the
    // same idempotency key, including when replacing an old trial session.
    const pending=await getFirestoreDocument(path);
    await commitFirestoreWrites([{update:{name:firestoreDocumentName(path),fields:{...pending?.fields,sessionId:{stringValue:""},offerVersion:{stringValue:String(PLUS_OFFER_VERSION)},priceId:{stringValue:serverConfig(regions[profile.country].priceKey)}}},currentDocument:{updateTime:pending!.updateTime}}]);
    const body = new URLSearchParams({
      mode:"subscription", "line_items[0][price]":serverConfig(regions[profile.country].priceKey), "line_items[0][quantity]":"1",
      success_url:`${origin}/?checkout=success`, cancel_url:`${origin}/?checkout=cancelled`,
      customer:customerId, payment_method_collection:"always",locale:lang,
      integration_identifier:`circle-plus-freemium-${attemptId.replace(/-/g,"").slice(0,8).replace(/[0-9a-f]/g,char=>String.fromCharCode(97+parseInt(char,16)))}`,
      "metadata[uid]":user.localId, "subscription_data[metadata][uid]":user.localId,
      "subscription_data[metadata][app]":"veyro-circle", "subscription_data[metadata][plan]":"plus", allow_promotion_codes:"true",
    });
    // Plus is an explicit paid choice; basic access never expires.
    const offer=circlePlusOffer(lang,profile.country);
    body.set("custom_text[submit][message]",`${offer.payment} ${offer.renewal}`);
    const session = await stripeRequest("/checkout/sessions", body, `circle-plus-checkout:${attemptId}`);
    sessionFields={sessionId:{stringValue:String(session.id)},trialEligible:{booleanValue:false},offerVersion:{stringValue:String(PLUS_OFFER_VERSION)}};
    return Response.json({url:session.url},{headers});
  } catch (error) { return Response.json({error:error instanceof Error ? error.message : "Betalingen kunne ikke startes"},{status:400,headers}); }
  finally {
    if(lockPath){
      const lock=await getFirestoreDocument(lockPath);
      if(lock?.fields?.attemptId?.stringValue===attemptId)await commitFirestoreWrites([{update:{name:firestoreDocumentName(lockPath),fields:{...lock.fields,...sessionFields,busyUntil:{timestampValue:new Date(0).toISOString()}}},currentDocument:{updateTime:lock.updateTime}}]);
    }
  }
}
