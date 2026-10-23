import { NextResponse } from "next/server";
import { getOrCreateInviteCode, invitationMetrics, invitationSignups } from "@/lib/invitation-server";
import { verifyFirebaseRequest } from "@/lib/firebase-server";
import { canAccessOwnerMap } from "@/lib/owner-map-access";

const headers = {"cache-control":"private, no-store"};
export async function GET(request:Request) {
  let identity;
  try { identity=await verifyFirebaseRequest(request); }
  catch { return NextResponse.json({error:"AUTH_REQUIRED"},{status:401,headers}); }
  try {
    const [code,signups]=await Promise.all([
      getOrCreateInviteCode(identity.localId),invitationSignups(identity.localId),
    ]);
    return NextResponse.json({code,...invitationMetrics(signups),admin:canAccessOwnerMap(identity)},{headers});
  } catch (cause) {
    const message = cause instanceof Error&&cause.message==="PROFILE_REQUIRED"?"PROFILE_REQUIRED":"INVITATIONS_UNAVAILABLE";
    return NextResponse.json({error:message},{status:message==="PROFILE_REQUIRED"?404:500,headers});
  }
}
