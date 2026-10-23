import { NextResponse } from "next/server";
import { verifyFirebaseRequest } from "@/lib/firebase-server";
import { canAccessOwnerMap } from "@/lib/owner-map-access";
import { invitationMetrics, invitationSignups } from "@/lib/invitation-server";

const headers = {"cache-control":"private, no-store"};
export async function GET(request:Request) {
  let identity;
  try { identity=await verifyFirebaseRequest(request); }
  catch { return NextResponse.json({error:"AUTH_REQUIRED"},{status:401,headers}); }
  if (!canAccessOwnerMap(identity)) return NextResponse.json({error:"OWNER_ACCESS_REQUIRED"},{status:403,headers});
  try {
    const signups=await invitationSignups();
    return NextResponse.json({...invitationMetrics(signups)},{headers});
  } catch {
    return NextResponse.json({error:"INVITATION_STATISTICS_UNAVAILABLE"},{status:500,headers});
  }
}
