import type { User } from "firebase/auth";

export class BillingOfferChangedError extends Error {}
export class BillingPortalUnavailableError extends Error {}

export async function openBilling(user: User, action: "checkout" | "portal",offer?:{expectedTrialEligible:boolean;expectedCountry:"DK" | "SE" | "NO";lang:"da" | "sv" | "nb"}) {
  if(action==="checkout"&&!offer)throw new BillingOfferChangedError("Kontrollér tilbuddet, før du fortsætter.");
  const response = await fetch(`/api/stripe/${action}`, { method:"POST", headers:{authorization:`Bearer ${await user.getIdToken()}`,"content-type":"application/json"},...(action==="checkout"?{body:JSON.stringify(offer)}:{}) });
  const data = await response.json() as {url?:string;error?:string;code?:string};
  if(data.code==="BILLING_OFFER_CHANGED")throw new BillingOfferChangedError(data.error);
  if(data.code==="BILLING_PORTAL_CUSTOMER_MISSING")throw new BillingPortalUnavailableError(data.error);
  if (!response.ok || !data.url) throw new Error(data.error || "Stripe kunne ikke åbnes");
  window.location.assign(data.url);
}
