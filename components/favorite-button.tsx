"use client";
import {Heart} from "lucide-react";
import type {Lang} from "@/lib/region";

export function FavoriteButton({active=false,busy,lang,onClick}:{active?:boolean;busy?:boolean;lang:Lang;onClick?:()=>void}) {
  const label=lang==="nb"?(active?"Fjern fra favoritter":"Lagre som favoritt"):lang==="da"?(active?"Fjern fra favoritter":"Gem som favorit"):(active?"Ta bort favorit":"Spara som favorit");
  return <button type="button" className="heart-button" disabled={busy} aria-pressed={active} aria-label={label} onClick={onClick}><Heart size={18} fill={active?"currentColor":"none"}/></button>;
}
