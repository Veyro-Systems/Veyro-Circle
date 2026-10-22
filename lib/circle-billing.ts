import { stripeRequest, StripeRequestError } from "@/lib/stripe-server";
import { serverConfig } from "@/lib/server-config";
import { COUNTRIES, regions } from "@/lib/region";

export const CIRCLE_PLUS_TRIAL_DAYS = 180;
export type BillingProfile = { subscriptionPlan:string; stripeCustomerId?:string; stripeSubscriptionId?:string; circlePlusStartedAt?:string; circlePlusTrialStartedAt?:string };
export type StripeRecord = Record<string, unknown>;
export type StripeSubscription = StripeRecord & {id:string;customer:string|{id:string};status:string;metadata?:{uid?:string;app?:string;plan?:string};trial_end?:number;cancel_at_period_end?:boolean;items?:{data?:Array<{current_period_end?:number;price?:{id?:string;product?:string|{id:string}}}>}};
export const hasPlusAccess = (status:string) => status === "active" || status === "trialing";
export const stripeId = (value:unknown):string => typeof value === "string" ? value : value && typeof value === "object" && "id" in value ? String(value.id) : "";

export class PortalCustomerUnavailableError extends Error {
  constructor() { super("Der er ingen Stripe-betalingskonto at administrere for dette login. Din adgang er uændret. Der er ikke oprettet et nyt abonnement eller trukket penge."); }
}

export async function portalCustomerId(uid:string,email:string,profile:BillingProfile) {
  if(profile.stripeCustomerId){
    try {
      const customer=await stripeRequest(`/customers/${encodeURIComponent(profile.stripeCustomerId)}`);
      if(!customer.deleted){
        const owner=(customer.metadata as {uid?:string}|undefined)?.uid;
        if(owner && owner!==uid)throw Error("Stripe-kunden matcher ikke din konto. Kontakt support.");
        return stripeId(customer);
      }
    }catch(error){
      if(!(error instanceof StripeRequestError && error.status===404 && error.code==="resource_missing"))throw error;
    }
  }
  // A legacy test customer cannot be opened with the Live key. Recover only
  // through the verified email AND the server-recorded Firebase UID on Stripe.
  // Email alone is not sufficient to grant access to another billing account.
  const matches=(await all(`/customers?email=${encodeURIComponent(email)}`)).filter(customer=>!customer.deleted && (customer.metadata as {uid?:string}|undefined)?.uid===uid);
  if(matches.length!==1)throw new PortalCustomerUnavailableError();
  return stripeId(matches[0]);
}

async function all(path:string) {
  const result:StripeRecord[]=[];
  let cursor="";
  do {
    const page=await stripeRequest(`${path}${path.includes("?") ? "&" : "?"}limit=100${cursor ? `&starting_after=${encodeURIComponent(cursor)}` : ""}`);
    const records=page.data as StripeRecord[];
    if(!Array.isArray(records))throw Error("Stripe-historikken kunne ikke kontrolleres.");
    result.push(...records);
    cursor=page.has_more ? stripeId(records.at(-1)) : "";
    if(page.has_more && !cursor)throw Error("Stripe-historikken er ufuldstændig.");
  }while(cursor);
  return result;
}

// A stale Sandbox ID is not a valid Live customer. Outages and permission
// failures must never silently create a replacement or grant a trial.
export async function circlePlusCatalog() {
  const priceIds=COUNTRIES.map(country=>serverConfig(regions[country].priceKey));
  const products=new Set<string>();
  for(const country of COUNTRIES){
    const region=regions[country];
    const priceId=serverConfig(region.priceKey);
    const price=await stripeRequest(`/prices/${encodeURIComponent(priceId)}`);
    if(!stripeId(price.product))throw Error("Circle Plus-prisen kunne ikke kontrolleres.");
    const recurring=price.recurring as {interval?:string;interval_count?:number}|undefined;
    if(price.active!==true || price.currency!==region.currency.toLowerCase() || price.unit_amount!==region.monthlyPrice*100 || recurring?.interval!=="month" || recurring.interval_count!==1 || (products.size>0&&!products.has(stripeId(price.product))))throw Error("Circle Plus-prisen kunne ikke kontrolleres.");
    products.add(stripeId(price.product));
  }
  return {priceIds,products};
}
export function isCirclePlus(subscription:StripeSubscription,catalog:Awaited<ReturnType<typeof circlePlusCatalog>>) {
  return subscription.metadata?.app==="veyro-circle" && subscription.metadata?.plan==="plus" || subscription.items?.data?.some(item=>catalog.priceIds.includes(item.price?.id??"") || catalog.products.has(stripeId(item.price?.product)))===true;
}
export async function billingContext(uid:string,email:string,profile:BillingProfile) {
  const catalog=await circlePlusCatalog();
  const customers=new Map<string,StripeRecord>();
  let storedCustomer:StripeRecord|undefined;
  if(profile.stripeCustomerId){
    try {
      const customer=await stripeRequest(`/customers/${encodeURIComponent(profile.stripeCustomerId)}`);
      if(!customer.deleted)storedCustomer=customer;
    }catch(error){if(!(error instanceof StripeRequestError && error.status===404 && error.code==="resource_missing"))throw error;}
  }
  if(storedCustomer){
    const metadata=storedCustomer.metadata as {uid?:string}|undefined;
    if(metadata?.uid && metadata.uid!==uid)throw Error("Stripe-kunden matcher ikke din konto. Kontakt support.");
    customers.set(stripeId(storedCustomer),storedCustomer);
  }
  // Includes legacy customers created by Checkout without UID metadata.
  for(const customer of await all(`/customers?email=${encodeURIComponent(email)}`)){
    if(!customer.deleted)customers.set(stripeId(customer),customer);
  }
  const subscriptions:StripeSubscription[]=[];
  for(const customerId of customers.keys())subscriptions.push(...await all(`/subscriptions?customer=${encodeURIComponent(customerId)}&status=all`) as StripeSubscription[]);
  // The Stripe account also sells other Veyro products. Those subscriptions
  // must not consume a first Circle Plus trial. Matching the product also
  // covers canceled subscriptions on a retired Circle Plus price.
  const plus=subscriptions.filter(s=>s.id===profile.stripeSubscriptionId || isCirclePlus(s,catalog));
  const blocking=plus.some(s=>!["canceled","incomplete_expired"].includes(s.status));
  const eligible=!profile.circlePlusStartedAt && !profile.circlePlusTrialStartedAt && !profile.stripeSubscriptionId && profile.subscriptionPlan!=="plus" && plus.length===0;
  const reusable=storedCustomer ?? [...customers.values()].find(c=>{
    const metadata=c.metadata as {uid?:string}|undefined;
    return !metadata?.uid || metadata.uid===uid;
  });
  return {eligible,blocking,customerId:reusable?stripeId(reusable):undefined};
}

export function subscriptionValues(subscription:StripeSubscription) {
  return {
    customerId:stripeId(subscription.customer),subscriptionId:subscription.id,
    active:hasPlusAccess(subscription.status),status:subscription.status,
    trialEnd:subscription.trial_end ? new Date(subscription.trial_end*1000).toISOString() : undefined,
    cancelAtPeriodEnd:subscription.cancel_at_period_end===true,
    trialUsed:!!subscription.trial_end,
  };
}
