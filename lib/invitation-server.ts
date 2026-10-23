import { randomBytes } from "node:crypto";
import { commitFirestoreWrites, firestoreDocumentName, getFirestoreDocument, serviceToken, type FirestoreField } from "@/lib/firebase-server";
import { serverConfig } from "@/lib/server-config";
import { validInviteCode } from "@/lib/invitation-client";

const str = (value: string): FirestoreField => ({stringValue:value});
const timestamp = (value: string): FirestoreField => ({timestampValue:value});

// Opaque, stable code. The Firestore document, not any client-provided UID, resolves ownership.
export async function getOrCreateInviteCode(uid: string): Promise<string> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const owner = await getFirestoreDocument(`users/${uid}`);
    if (!owner?.fields?.name?.stringValue) throw new Error("PROFILE_REQUIRED");
    const existing = owner.fields.inviteCode?.stringValue;
    if (validInviteCode(existing)) {
      const reference=await getFirestoreDocument(`inviteCodes/${existing}`);
      if(reference?.fields?.inviterUid?.stringValue===uid)return existing;
    }
    const code = randomBytes(12).toString("base64url");
    const now = new Date().toISOString();
    try {
      await commitFirestoreWrites([
        {update:{name:firestoreDocumentName(`inviteCodes/${code}`),fields:{inviterUid:str(uid),createdAt:timestamp(now)}},currentDocument:{exists:false}},
        {update:{name:firestoreDocumentName(`users/${uid}`),fields:{inviteCode:str(code)}},updateMask:{fieldPaths:["inviteCode"]},currentDocument:{updateTime:owner.updateTime}},
      ]);
      return code;
    } catch (cause) {
      if (!(cause instanceof Error) || cause.message !== "IDENTITY_CONFLICT" || attempt === 3) throw cause;
    }
  }
  throw new Error("INVITE_CODE_FAILED");
}

export async function lookupInviter(code: unknown, inviteeUid: string): Promise<string | null> {
  if (!validInviteCode(code)) return null;
  try {
    const reference = await getFirestoreDocument(`inviteCodes/${code}`);
    const inviterUid = reference?.fields?.inviterUid?.stringValue;
    if (!inviterUid || inviterUid === inviteeUid) return null;
    const owner=await getFirestoreDocument(`users/${inviterUid}`);
    return owner?.fields?.inviteCode?.stringValue===code&&owner.fields.name?.stringValue?inviterUid:null;
  }catch{console.warn("Circle invitation lookup unavailable");return null;}
}

export type InvitationSignup = {inviterUid:string; firstListingAt?:string};
export async function invitationSignups(inviterUid?: string): Promise<InvitationSignup[]> {
  const query: Record<string,unknown> = {from:[{collectionId:"inviteSignups"}],select:{fields:[{fieldPath:"inviterUid"},{fieldPath:"firstListingAt"}]}};
  if (inviterUid) query.where = {fieldFilter:{field:{fieldPath:"inviterUid"},op:"EQUAL",value:{stringValue:inviterUid}}};
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(serverConfig("NEXT_PUBLIC_FIREBASE_PROJECT_ID"))}/databases/(default)/documents:runQuery`,{
    method:"POST",cache:"no-store",headers:{authorization:`Bearer ${await serviceToken()}`,"content-type":"application/json"},body:JSON.stringify({structuredQuery:query}),signal:AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("INVITATION_STATISTICS_UNAVAILABLE");
  const rows = await response.json() as Array<{document?:{fields?:Record<string,FirestoreField>}}>; 
  return rows.flatMap(({document}) => document?.fields?.inviterUid?.stringValue ? [{
    inviterUid:document.fields.inviterUid.stringValue,
    firstListingAt:document.fields.firstListingAt?.timestampValue,
  }] : []);
}

export function invitationMetrics(signups:InvitationSignup[]) {
  return {registrations:signups.length,sharedAtLeastOnce:signups.filter(row=>Boolean(row.firstListingAt)).length};
}

// This runs after the listing has been committed. A tracking error never blocks a listing.
export async function markInvitedUserShared(uid:string) {
  try {
    const path = `inviteSignups/${uid}`;
    const record = await getFirestoreDocument(path);
    if (!record || record.fields?.firstListingAt?.timestampValue) return;
    await commitFirestoreWrites([{
      update:{name:firestoreDocumentName(path),fields:{firstListingAt:timestamp(new Date().toISOString())}},
      updateMask:{fieldPaths:["firstListingAt"]},currentDocument:{updateTime:record.updateTime},
    }]);
  } catch {
    console.warn("Circle invitation activation tracking unavailable");
  }
}
