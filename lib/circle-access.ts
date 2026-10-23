import { listingLimit, type ListingPlan } from "./listing-limits";

export const FREE_ACCESS_DAYS=180;
export type AccessProfile={subscriptionPlan?:string;createdAt?:string;freeAccessStartedAt?:string};
export type CircleAccess={plan:ListingPlan;canUseApp:boolean;paymentRequired:boolean;freeUntil?:string;daysLeft:number;listingLimit:number};
export function circleAccess(profile:AccessProfile,now=Date.now()):CircleAccess {
  const start=Date.parse(profile.freeAccessStartedAt || profile.createdAt || "");
  const deadline=Number.isFinite(start) ? start+FREE_ACCESS_DAYS*86400000 : NaN;
  const free=Number.isFinite(deadline) && now<deadline && now>=start;
  const plan:ListingPlan=profile.subscriptionPlan==="plus"?"plus":free?"free":"expired";
  return {plan,canUseApp:plan!=="expired",paymentRequired:plan==="expired",freeUntil:Number.isFinite(deadline)?new Date(deadline).toISOString():undefined,daysLeft:free?Math.ceil((deadline-now)/86400000):0,listingLimit:listingLimit(plan)};
}
