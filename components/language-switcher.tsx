"use client";
import { Languages } from "lucide-react";
import { LANGUAGES, languageNames, isLang, type Lang } from "@/lib/region";

export function LanguageSwitcher({lang,onChange,disabled=false,compact=false,flags=false,countries=false}:{lang:Lang;onChange:(value:Lang)=>void;disabled?:boolean;compact?:boolean;flags?:boolean;countries?:boolean}) {
  const label=lang==="nb"?"Velg språk":lang==="sv"?"Välj språk":"Vælg sprog";
  if(flags)return <div className="sidebar-languages" role="group" aria-label={label}>{LANGUAGES.map(value=><button type="button" key={value} lang={value} aria-label={countries?({da:"Danmark",sv:"Sverige",nb:"Norge"}[value]):languageNames[value]} aria-pressed={lang===value} disabled={disabled} onClick={()=>onChange(value)}><NordicFlag lang={value}/><span>{countries?({da:"Danmark",sv:"Sverige",nb:"Norge"}[value]):value==="nb"?"NO":value.toUpperCase()}</span></button>)}</div>;
  if(compact)return <label className="language-button"><Languages size={18} aria-hidden="true"/><select aria-label={label} value={lang} disabled={disabled} onChange={event=>{if(isLang(event.target.value))onChange(event.target.value);}}>{LANGUAGES.map(value=><option key={value} value={value}>{value==="nb"?"NO":value.toUpperCase()}</option>)}</select></label>;
  return <div className="auth-language" role="group" aria-label={label}>{LANGUAGES.map(value=><button type="button" key={value} lang={value} className={lang===value?"active":""} disabled={disabled} onClick={()=>onChange(value)}>{languageNames[value]}</button>)}</div>;
}

function NordicFlag({lang}:{lang:Lang}){const background=lang==="sv"?"#006aa7":lang==="nb"?"#ba0c2f":"#c8102e",cross=lang==="sv"?"#fecc00":"#fff";return <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true"><rect width="28" height="20" rx="1" fill={background}/><path d="M9 0v20M0 10h28" stroke={cross} strokeWidth={lang==="nb"?6:4}/>{lang==="nb"&&<path d="M9 0v20M0 10h28" stroke="#00205b" strokeWidth="3"/>}</svg>;}
