// Server-owned UID/email allowlist. Never accept ownership from a request or profile form.
export function canAccessOwnerMap(identity:{localId:string;email:string;emailVerified:boolean}) {
  if(!identity.emailVerified)return false;
  const allowed=(process.env.CIRCLE_MAP_OWNER_UIDS??"").split(",").map(value=>value.trim()).filter(Boolean);
  const emails=(process.env.CIRCLE_MAP_OWNER_EMAILS??"").split(",").map(value=>value.trim().toLowerCase()).filter(Boolean);
  return Boolean(identity.localId)&&(allowed.includes(identity.localId)||emails.includes(identity.email.toLowerCase()));
}
