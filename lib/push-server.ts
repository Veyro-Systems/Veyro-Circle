import { createHash } from "node:crypto";
import { commitFirestoreWrites, firestoreDocumentName, getFirestoreDocument, serviceToken } from "@/lib/firebase-server";
import { serverConfig } from "@/lib/server-config";
import {canAccessOwnerMap} from "@/lib/owner-map-access";

export const pushId = (token:string) => createHash("sha256").update(token).digest("hex");
export function validPushToken(token:unknown):token is string { return typeof token === "string" && token.length >= 20 && token.length <= 4096 && /^[A-Za-z0-9_:\-]+$/.test(token); }
export type CirclePushKind="requested"|"message"|"search"|"signup";
type PushDevice={name:string;updateTime:string;fields:Record<string,{stringValue?:string;timestampValue?:string;booleanValue?:boolean}>};
export function pushPayload(kind:CirclePushKind,id:string,lang:string) {
  if(kind==="signup")return {title:"Veyro Circle",body:lang==="nb"?"En ny bruker har registrert seg i Veyro Circle.":lang==="sv"?"En ny användare har registrerat sig i Veyro Circle.":"En ny bruger har tilmeldt sig Veyro Circle.",url:"/?push=signup",tag:`circle-${id}-signup`};
  return { title:"Veyro Circle", body:lang === "nb" ? (kind === "search" ? "En ny annonse passer til det lagrede søket ditt." : kind === "message" ? "Du har fått en ny melding i Circle." : "Du har fått en ny låneforespørsel i Circle.") : kind === "search" ? (lang === "sv" ? "En ny annons matchar din sparade sökning." : "En ny annonce matcher din gemte søgning.") : lang === "sv" ? (kind === "message" ? "Du har fått ett nytt meddelande i Circle." : "Du har fått en ny låneförfrågan i Circle.") : (kind === "message" ? "Du har fået en ny besked i Circle." : "Du har fået en ny låneforespørgsel i Circle."), url:kind === "search" ? `/?listing=${encodeURIComponent(id)}&push=search` : `/?ticket=${encodeURIComponent(id)}&push=${kind}`, tag:`circle-${id}-${kind}` };
}

// Only called after a successful server-authorised write; no client-selected recipients.
// Push is best effort: an unavailable push service must never undo a saved message.
async function deliverPush(kind:CirclePushKind,id:string,field:string,value:{stringValue:string}|{booleanValue:boolean},allowed:(device:PushDevice)=>boolean) {
  if (process.env.CIRCLE_PUSH_ENABLED !== "true") return;
  try {
    const project=serverConfig("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    const query=await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents:runQuery`,{method:"POST",headers:{authorization:`Bearer ${await serviceToken()}`,"content-type":"application/json"},body:JSON.stringify({structuredQuery:{from:[{collectionId:"pushDevices"}],where:{fieldFilter:{field:{fieldPath:field},op:"EQUAL",value}},...(kind==="signup"?{}:{limit:20})}}),signal:AbortSignal.timeout(8000)});
    if (!query.ok) throw new Error("PUSH_QUERY");
    const rows=await query.json() as Array<{document?:PushDevice}>;
    const access=await serviceToken("messaging");
    await Promise.all(rows.map(async ({document:d})=>{
      if (!d || !allowed(d) || !d.fields.token?.stringValue || !(Date.parse(d.fields.expiresAt?.timestampValue ?? "") > Date.now())) return;
      // Read ownership again before sending, in case this browser switched accounts.
      const current=await getFirestoreDocument(`pushDevices/${pushId(d.fields.token.stringValue)}`);
      if (!current || current.fields?.uid?.stringValue !== d.fields.uid?.stringValue || current.updateTime !== d.updateTime || !allowed(current as PushDevice)) return;
      const response=await fetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(project)}/messages:send`,{method:"POST",headers:{authorization:`Bearer ${access}`,"content-type":"application/json"},body:JSON.stringify({message:{token:d.fields.token.stringValue,data:pushPayload(kind,id,d.fields.lang?.stringValue ?? "da"),webpush:{headers:{TTL:"3600",Urgency:"high"}}}}),signal:AbortSignal.timeout(8000)});
      if (!response.ok) {
        const result=await response.json();
        if (result.error?.details?.some((v:{errorCode?:string})=>v.errorCode === "UNREGISTERED")) await commitFirestoreWrites([{delete:firestoreDocumentName(`pushDevices/${pushId(d.fields.token.stringValue)}`),currentDocument:{updateTime:d.updateTime}}]);
        else console.warn("Circle push delivery failed",response.status);
      }
    }));
  } catch { console.warn("Circle push unavailable; saved activity remains in Circle"); }
}

export async function sendCirclePush(uid:string,kind:Exclude<CirclePushKind,"signup">,id:string) {
  await deliverPush(kind,id,"uid",{stringValue:uid},device=>device.fields.uid?.stringValue===uid);
}

// Device ownership is assigned from verified authentication in /api/push.
// Recheck the current server allowlist; a caller cannot choose recipients.
export async function notifyOwnersOfSignup(uid:string) {
  await deliverPush("signup",pushId(uid),"signupOwner",{booleanValue:true},device=>device.fields.signupOwner?.booleanValue===true&&canAccessOwnerMap({localId:device.fields.uid?.stringValue??"",email:device.fields.ownerEmail?.stringValue??"",emailVerified:true}));
}
