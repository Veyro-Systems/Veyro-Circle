"use client";
import { Languages } from "lucide-react";
import { LANGUAGES, languageNames, isLang, type Lang } from "@/lib/region";

export function LanguageSwitcher({lang,onChange,disabled=false,compact=false}:{lang:Lang;onChange:(value:Lang)=>void;disabled?:boolean;compact?:boolean}) {
  const label=lang==="nb"?"Velg språk":lang==="sv"?"Välj språk":"Vælg sprog";
  if(compact)return <label className="language-button"><Languages size={18} aria-hidden="true"/><select aria-label={label} value={lang} disabled={disabled} onChange={event=>{if(isLang(event.target.value))onChange(event.target.value);}}>{LANGUAGES.map(value=><option key={value} value={value}>{value==="nb"?"NO":value.toUpperCase()}</option>)}</select></label>;
  return <div className="auth-language" role="group" aria-label={label}>{LANGUAGES.map(value=><button type="button" key={value} lang={value} className={lang===value?"active":""} disabled={disabled} onClick={()=>onChange(value)}>{languageNames[value]}</button>)}</div>;
}
