import { verifyFirebaseRequest, getServerProfile, getFirestoreDocument, commitFirestoreWrites, firestoreDocumentName } from "@/lib/firebase-server";
import { serverConfig } from "@/lib/server-config";
import { stripeRequest } from "@/lib/stripe-server";
import { billingContext, CIRCLE_PLUS_TRIAL_DAYS } from "@/lib/circle-billing";
import { circlePlusOffer, trialCopy } from "@/lib/circle-plus-copy";

const headers={"cache-control":"private, no-store"};
export async function GET(request:Request) {
  try {
    const user=await verifyFirebaseRequest(request);
    const profile=await getServerProfile(user.localId);
    const context=await billingContext(user.localId,user.email,profile);
    return Response.json({trialEligible:context.eligible,hasSubscription:context.blocking||profile.subscriptionPlan==="plus",country:profile.country},{headers});
  }catch{return Response.json({error:"Prøveperioden kunne ikke kontrolleres. Prøv igen."},{status:503,headers});}
}

export async function POST(request: Request) {
  let lockPath="",attemptId="";
  let sessionFields:Record<string,{stringValue?:string;timestampValue?:string;booleanValue?:boolean}>={};
  try {
    const user = await verifyFirebaseRequest(request);
    const profile = await getServerProfile(user.localId);
    if (profile.subscriptionPlan === "plus") throw new Error("Du har allerede Circle Plus");
    const accepted=await request.json().catch(()=>null) as {expectedTrialEligible?:unknown;expectedCountry?:unknown;lang?:unknown}|null;
    const path=`billingCheckouts/${user.localId}`;
    const previous=await getFirestoreDocument(path);
    if(Date.parse(previous?.fields?.busyUntil?.timestampValue ?? "")>Date.now())return Response.json({error:"En tilmelding behandles allerede. Prøv igen om lidt."},{status:409,headers});
    attemptId=(!previous?.fields?.sessionId?.stringValue && previous?.fields?.attemptId?.stringValue) || crypto.randomUUID();
    await commitFirestoreWrites([{update:{name:firestoreDocumentName(path),fields:{...previous?.fields,attemptId:{stringValue:attemptId},busyUntil:{timestampValue:new Date(Date.now()+300_000).toISOString()}}},currentDocument:previous?{updateTime:previous.updateTime}:{exists:false}}]);
    lockPath=path;
    const context=await billingContext(user.localId,user.email,profile);
    if(context.blocking)throw Error("Der findes allerede et abonnement. Administrer det fra din konto.");
    if(accepted?.expectedTrialEligible!==context.eligible || accepted?.expectedCountry!==profile.country)return Response.json({code:"BILLING_OFFER_CHANGED",error:"Tilbuddet har ændret sig. Kontrollér prisen igen, før du fortsætter."},{status:409,headers});
    const lang=accepted.lang==="sv"?"sv":accepted.lang==="da"?"da":profile.country==="SE"?"sv":"da";
    const oldSessionId=previous?.fields?.sessionId?.stringValue;
    if(oldSessionId){
      const old=await stripeRequest(`/checkout/sessions/${encodeURIComponent(oldSessionId)}`);
      if(old.status==="open"){
        if(previous?.fields?.trialEligible?.booleanValue===context.eligible && old.customer===context.customerId && old.currency===(profile.country==="SE"?"sek":"dkk") && old.locale===lang && previous.fields.offerVersion?.stringValue==="2" && Array.isArray(old.payment_method_types) && old.payment_method_types.length===1 && old.payment_method_types[0]==="card")return Response.json({url:old.url},{headers});
        await stripeRequest(`/checkout/sessions/${encodeURIComponent(oldSessionId)}/expire`,new URLSearchParams());
      }
    }
    let customerId=context.customerId;
    if(!customerId){
      const customer=await stripeRequest("/customers",new URLSearchParams({email:user.email,"metadata[uid]":user.localId}),`circle-plus-customer:${user.localId}`);
      customerId=String(customer.id);
    }
    const origin = new URL(request.url).origin;
    const body = new URLSearchParams({
      mode:"subscription", "line_items[0][price]":serverConfig(profile.country === "SE" ? "STRIPE_PRICE_SEK" : "STRIPE_PRICE_DKK"), "line_items[0][quantity]":"1",
      success_url:`${origin}/?checkout=success`, cancel_url:`${origin}/?checkout=cancelled`,
      customer:customerId, payment_method_collection:"always","payment_method_types[0]":"card",locale:lang,
      "metadata[uid]":user.localId, "subscription_data[metadata][uid]":user.localId,
      "subscription_data[metadata][app]":"veyro-circle", "subscription_data[metadata][plan]":"plus", allow_promotion_codes:"true",
    });
    if(context.eligible){
      body.set("subscription_data[trial_period_days]",String(CIRCLE_PLUS_TRIAL_DAYS));
      body.set("subscription_data[trial_settings][end_behavior][missing_payment_method]","cancel");
    }
    const offer=circlePlusOffer(lang,profile.country,context.eligible);
    body.set("custom_text[submit][message]",`${offer.payment} ${offer.renewal} ${context.eligible?trialCopy[lang].card:trialCopy[lang].returning}`);
    const session = await stripeRequest("/checkout/sessions", body, `circle-plus-checkout:${attemptId}`);
    sessionFields={sessionId:{stringValue:String(session.id)},trialEligible:{booleanValue:context.eligible},offerVersion:{stringValue:"2"}};
    return Response.json({url:session.url},{headers});
  } catch (error) { return Response.json({error:error instanceof Error ? error.message : "Betalingen kunne ikke startes"},{status:400,headers}); }
  finally {
    if(lockPath){
      const lock=await getFirestoreDocument(lockPath);
      if(lock?.fields?.attemptId?.stringValue===attemptId)await commitFirestoreWrites([{update:{name:firestoreDocumentName(lockPath),fields:{...lock.fields,...sessionFields,busyUntil:{timestampValue:new Date(0).toISOString()}}},currentDocument:{updateTime:lock.updateTime}}]);
    }
  }
}
