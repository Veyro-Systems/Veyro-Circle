import { listingLimit, type ListingPlan } from "./listing-limits";

export type AccessProfile={subscriptionPlan?:string;createdAt?:string;freeAccessStartedAt?:string};
export type CircleAccess={plan:ListingPlan;canUseApp:boolean;paymentRequired:boolean;listingLimit:number};
export function circleAccess(profile:AccessProfile):CircleAccess {
  // Historic trial dates remain stored, but cannot expire basic access.
  // Only the server-maintained paid entitlement increases the listing limit.
  const plan:ListingPlan=profile.subscriptionPlan==="plus"?"plus":"free";
  return {plan,canUseApp:true,paymentRequired:false,listingLimit:listingLimit(plan)};
}
