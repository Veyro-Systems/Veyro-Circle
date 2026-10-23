export const INVITE_STORAGE_KEY = "veyro:circle:invite";
export const INVITE_CODE_PATTERN = /^[A-Za-z0-9_-]{16}$/;
export const INVITE_LIFETIME_MS = 30 * 86400000;
export const INVITATION_CONSENT_VERSION="circle-invitation-v1";

export function validInviteCode(value: unknown): value is string {
  return typeof value === "string" && INVITE_CODE_PATTERN.test(value);
}

// A code survives the email-verification return trip. Never collect contact data here.
export function rememberInviteFromUrl(url: string, storage: Pick<Storage, "setItem" | "getItem">, now=Date.now()): boolean {
  const code = new URL(url).searchParams.get("invite");
  if (!validInviteCode(code)) return false;
  storage.setItem(INVITE_STORAGE_KEY, JSON.stringify({code,expiresAt:now+INVITE_LIFETIME_MS,consentVersion:INVITATION_CONSENT_VERSION}));
  return true;
}

export function pendingInvite(storage: Pick<Storage, "getItem"> & Partial<Pick<Storage,"removeItem">>,now=Date.now()): string | undefined {
  try {
    const record=JSON.parse(storage.getItem(INVITE_STORAGE_KEY)??"null");
    if(validInviteCode(record?.code)&&record.consentVersion===INVITATION_CONSENT_VERSION&&Number.isFinite(record.expiresAt)&&record.expiresAt>now)return record.code;
  }catch{/* Invalid local data cannot prevent login or profile completion. */}
  storage.removeItem?.(INVITE_STORAGE_KEY);
  return undefined;
}

export function invitationLink(code:string,lang:"da"|"sv"|"nb",origin:string) {
  if(!validInviteCode(code))throw Error("INVALID_INVITE_CODE");
  const url=new URL("/",origin);url.searchParams.set("invite",code);url.searchParams.set("lang",lang);return url.href;
}

export async function shareInvitation(data:ShareData,device:Pick<Navigator,"share"|"clipboard">):Promise<"shared"|"copied"|"cancelled"> {
  if(device.share){try{await device.share(data);return "shared";}catch(cause){if(cause instanceof Error&&cause.name==="AbortError")return "cancelled";}}
  await device.clipboard.writeText(data.url??"");return "copied";
}
