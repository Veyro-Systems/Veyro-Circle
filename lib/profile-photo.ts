export function isOwnProfilePhotoPath(uid:string,path:unknown):path is string {
 return typeof path==="string"&&path.startsWith(`profile-photos/${uid}/`)&&/^[a-f0-9-]{36}\.jpg$/.test(path.slice(`profile-photos/${uid}/`.length));
}
export function publicProfilePhotoUrl(uid:string,value:unknown,bucket:string):string|undefined {
 if(!value||typeof value!=="object"||Array.isArray(value))return;
 const photo=value as Record<string,unknown>;if(!isOwnProfilePhotoPath(uid,photo.storagePath)||typeof photo.src!=="string")return;
 try {const url=new URL(photo.src);if(url.protocol==="https:"&&url.hostname==="firebasestorage.googleapis.com"&&!url.username&&!url.password&&url.pathname===`/v0/b/${bucket}/o/${encodeURIComponent(photo.storagePath)}`&&url.searchParams.get("alt")==="media"&&/^[a-f0-9-]{36}$/.test(url.searchParams.get("token")??""))return url.href;}catch{}
}
