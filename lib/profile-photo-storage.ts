import {serviceToken} from "@/lib/firebase-server";
import {serverConfig} from "@/lib/server-config";
export async function putProfilePhoto(path:string,bytes:Uint8Array) {
 const bucket=serverConfig("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),token=crypto.randomUUID(),boundary=`circle_${crypto.randomUUID()}`;
 const metadata={name:path,contentType:"image/jpeg",cacheControl:"public, max-age=3600",metadata:{firebaseStorageDownloadTokens:token}};
 const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: image/jpeg\r\n\r\n`,new Uint8Array(bytes),`\r\n--${boundary}--\r\n`]);
 const response=await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=multipart&ifGenerationMatch=0`,{method:"POST",headers:{authorization:`Bearer ${await serviceToken("storage")}`,"content-type":`multipart/related; boundary=${boundary}`},body,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("PROFILE_PHOTO_STORAGE");
 return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}
export async function deleteProfilePhoto(path:string) {
 const bucket=serverConfig("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
 const response=await fetch(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(path)}`,{method:"DELETE",headers:{authorization:`Bearer ${await serviceToken("storage")}`},signal:AbortSignal.timeout(15000)});
 if(!response.ok&&response.status!==404)throw Error("PROFILE_PHOTO_STORAGE");
}
