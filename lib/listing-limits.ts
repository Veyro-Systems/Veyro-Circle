export type ListingPlan = "free" | "plus" | "expired";
export const FREE_LISTING_LIMIT = 5;
export const PLUS_LISTING_LIMIT = 20;
export function listingLimit(plan: ListingPlan) { return plan === "plus" ? PLUS_LISTING_LIMIT : plan === "free" ? FREE_LISTING_LIMIT : 0; }
export function canCreateListing(activeListings:number,plan:ListingPlan) { return activeListings < listingLimit(plan); }
