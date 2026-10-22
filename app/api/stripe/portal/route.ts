import { verifyFirebaseRequest, getServerProfile } from "@/lib/firebase-server";
import { stripeRequest } from "@/lib/stripe-server";
import { portalCustomerId, PortalCustomerUnavailableError } from "@/lib/circle-billing";

const headers={"cache-control":"private, no-store"};

export async function POST(request: Request) {
  try {
    const user = await verifyFirebaseRequest(request); const profile = await getServerProfile(user.localId);
    if (!profile.stripeCustomerId && !profile.stripeSubscriptionId && profile.subscriptionPlan!=="plus")throw new PortalCustomerUnavailableError();
    const customer=await portalCustomerId(user.localId,user.email,profile);
    const session = await stripeRequest("/billing_portal/sessions", new URLSearchParams({customer,return_url:new URL(request.url).origin+"/?billing=return"}));
    return Response.json({url:session.url},{headers});
  } catch (error) { return Response.json({error:error instanceof Error ? error.message : "Kundeportalen kunne ikke åbnes",...(error instanceof PortalCustomerUnavailableError?{code:"BILLING_PORTAL_CUSTOMER_MISSING"}:{})},{status:error instanceof PortalCustomerUnavailableError?409:400,headers}); }
}
