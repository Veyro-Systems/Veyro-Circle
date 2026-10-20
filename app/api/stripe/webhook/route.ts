import { updateSubscription, getServerProfile, findUserByStripeCustomer } from "@/lib/firebase-server";
import { verifyStripeWebhook, stripeRequest, StripeRequestError } from "@/lib/stripe-server";
import { serverConfig } from "@/lib/server-config";
import { stripeId, subscriptionValues, isCirclePlus, circlePlusCatalog, type StripeSubscription } from "@/lib/circle-billing";

export async function POST(request: Request) {
  let event;
  try { event=await verifyStripeWebhook(await request.text(),request.headers.get("stripe-signature")); }
  catch { return Response.json({error:"Webhook-signaturen blev afvist."},{status:400}); }
  try {
    const object = event.data.object;
    // A Sandbox event must never update Live customer entitlements (or reverse).
    if(event.livemode!==serverConfig("STRIPE_SECRET_KEY").includes("_live_"))throw Error("Stripe-miljøet matcher ikke serveren.");
    let subscriptionId="";
    if(event.type==="checkout.session.completed" || event.type==="checkout.session.async_payment_succeeded"){
      if(object.mode!=="subscription")return Response.json({received:true});
      subscriptionId=stripeId(object.subscription);
    }else if(["customer.subscription.created","customer.subscription.updated","customer.subscription.deleted","customer.subscription.paused","customer.subscription.resumed"].includes(event.type)){
      subscriptionId=stripeId(object);
    }else if(event.type==="invoice.paid" || event.type==="invoice.payment_failed"){
      const parent=object.parent as {subscription_details?:{subscription?:unknown}}|undefined;
      subscriptionId=stripeId(object.subscription)||stripeId(parent?.subscription_details?.subscription);
    }
    if(!subscriptionId)return Response.json({received:true});
    // Read current state; webhook delivery order and invoice timestamps alone
    // cannot decide whether a customer currently has access.
    const subscription=await stripeRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`) as StripeSubscription;
    if(!isCirclePlus(subscription,await circlePlusCatalog()))return Response.json({received:true});
    const customerId=stripeId(subscription.customer);
    const owner=await findUserByStripeCustomer(customerId);
    const uid=owner || subscription.metadata?.uid;
    if(!uid)return Response.json({received:true});
    if(owner && subscription.metadata?.uid && owner!==subscription.metadata.uid)throw Error("Stripe-ejerskab matcher ikke profilen.");
    const profile=await getServerProfile(uid);
    if(profile.stripeSubscriptionId && profile.stripeSubscriptionId!==subscription.id){
      if(["canceled","incomplete_expired"].includes(subscription.status))return Response.json({received:true});
      try{
        const current=await stripeRequest(`/subscriptions/${encodeURIComponent(profile.stripeSubscriptionId)}`);
        if(!["canceled","incomplete_expired"].includes(String(current.status)))return Response.json({received:true});
      }catch(error){if(!(error instanceof StripeRequestError && error.status===404 && error.code==="resource_missing"))throw error;}
    }
    await updateSubscription(uid,subscriptionValues(subscription));
    return Response.json({received:true});
  } catch { return Response.json({error:"Webhook kunne ikke behandles. Stripe forsøger igen."},{status:500}); }
}
