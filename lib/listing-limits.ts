export type ListingPlan = "free" | "plus";
export const FREE_LISTING_LIMIT = 5;
export const PLUS_LISTING_LIMIT = 20;
export function listingLimit(plan: ListingPlan) { return plan === "plus" ? PLUS_LISTING_LIMIT : FREE_LISTING_LIMIT; }
export function canCreateListing(activeListings:number,plan:ListingPlan) { return activeListings < listingLimit(plan); }
