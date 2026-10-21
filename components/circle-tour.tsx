"use client";
import { nbText } from "@/lib/norwegian-copy";


import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CirclePlay, FileSignature, MapPin, MessageCircle, PackagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Lang } from "@/lib/marketplace";

const icons=[MapPin,MessageCircle,FileSignature,PackagePlus];
const content={
  da:[
    {label:"Find",title:"Tingene findes sikkert lige i nærheden",description:"En trailer til weekenden, værktøj til et projekt eller udstyr til festen. Find det hos andre i dit lokalområde.",points:["Se annoncer uden at oprette en konto.","Søg efter kategori, postnummer og afstand.","Vælg datoer, og se hvad der er ledigt."],note:"Det er gratis at søge efter ting."},
    {label:"Spørg",title:"Lån gratis, eller lej til en aftalt pris",description:"Opret en gratis Circle-konto og bekræft din e-mail. Så kan du spørge ejeren om at låne eller leje en ting.",points:["Vælg perioden og send en forespørgsel.","Se lejeprisen og ejerens eventuelle depositum.","Ejeren godkender, og I aftaler detaljerne i chatten."],note:"Du behøver ikke Circle Plus for at sende en forespørgsel."},
    {label:"Aftal",title:"En tydelig aftale fra start til slut",description:"Hold styr på det, I har aftalt, når tingen skifter hænder og kommer tilbage igen.",points:["Periode, pris og eventuelt depositum samles i aftalen.","Begge parter underskriver ved udlevering og tilbagelevering.","Gem noter og billeder af tingens stand sammen med aftalen."],note:"Adresse og kontaktoplysninger deles først i den godkendte aftale."},
    {label:"Del",title:"Del det, du ikke bruger hver dag",description:"Med Circle Plus kan du oprette op til 20 aktive annoncer og vælge gratis udlån eller betalt udlejning.",points:["180 dage gratis for nye, berettigede Circle Plus-kunder.","Derefter 49 DKK/md. i Danmark, 69 SEK/md. i Sverige eller 69 NOK/md. i Norge.","Ingen provision til Veyro Circle af jeres private lejeaftale."],note:"Du registrerer kort ved tilmelding. Abonnementet fortsætter automatisk efter prøven, medmindre du opsiger inden. Dit konkrete tilbud vises før tilmelding."},
  ],
  sv:[
    {label:"Hitta",title:"Sakerna finns säkert alldeles i närheten",description:"Ett släp till helgen, verktyg till ett projekt eller utrustning till festen. Hitta det hos andra i ditt närområde.",points:["Se annonser utan att skapa ett konto.","Sök efter kategori, postnummer och avstånd.","Välj datum och se vad som är ledigt."],note:"Det är gratis att söka efter saker."},
    {label:"Fråga",title:"Låna gratis eller hyr till ett avtalat pris",description:"Skapa ett gratis Circle-konto och bekräfta din e-postadress. Sedan kan du fråga ägaren om att låna eller hyra en sak.",points:["Välj perioden och skicka en förfrågan.","Se hyrespriset och ägarens eventuella deposition.","Ägaren godkänner och ni avtalar detaljerna i chatten."],note:"Du behöver inte Circle Plus för att skicka en förfrågan."},
    {label:"Avtala",title:"Ett tydligt avtal från början till slut",description:"Håll reda på det ni har avtalat när saken lämnas ut och kommer tillbaka igen.",points:["Period, pris och eventuell deposition samlas i avtalet.","Båda parter signerar vid utlämning och återlämning.","Spara anteckningar och bilder av sakens skick tillsammans med avtalet."],note:"Adress och kontaktuppgifter delas först i det godkända avtalet."},
    {label:"Dela",title:"Dela det du inte använder varje dag",description:"Med Circle Plus kan du skapa upp till 20 aktiva annonser och välja gratis utlåning eller betald uthyrning.",points:["180 dagar gratis för nya, berättigade Circle Plus-kunder.","Därefter 49 DKK/mån i Danmark, 69 SEK/mån i Sverige eller 69 NOK/mån i Norge.","Ingen provision till Veyro Circle på ert privata hyresavtal."],note:"Du registrerar kort vid registreringen. Prenumerationen fortsätter automatiskt efter provperioden om du inte säger upp den innan dess. Ditt erbjudande visas före registreringen."},
  ],
 nb: [
    {label:nbText["Find"],title:nbText["Tingene findes sikkert lige i nærheden"],description:nbText["En trailer til weekenden, værktøj til et projekt eller udstyr til festen. Find det hos andre i dit lokalområde."],points:[nbText["Se annoncer uden at oprette en konto."],nbText["Søg efter kategori, postnummer og afstand."],nbText["Vælg datoer, og se hvad der er ledigt."]],note:nbText["Det er gratis at søge efter ting."]},
    {label:nbText["Spørg"],title:nbText["Lån gratis, eller lej til en aftalt pris"],description:nbText["Opret en gratis Circle-konto og bekræft din e-mail. Så kan du spørge ejeren om at låne eller leje en ting."],points:[nbText["Vælg perioden og send en forespørgsel."],nbText["Se lejeprisen og ejerens eventuelle depositum."],nbText["Ejeren godkender, og I aftaler detaljerne i chatten."]],note:nbText["Du behøver ikke Circle Plus for at sende en forespørgsel."]},
    {label:nbText["Aftal"],title:nbText["En tydelig aftale fra start til slut"],description:nbText["Hold styr på det, I har aftalt, når tingen skifter hænder og kommer tilbage igen."],points:[nbText["Periode, pris og eventuelt depositum samles i aftalen."],nbText["Begge parter underskriver ved udlevering og tilbagelevering."],nbText["Gem noter og billeder af tingens stand sammen med aftalen."]],note:nbText["Adresse og kontaktoplysninger deles først i den godkendte aftale."]},
    {label:nbText["Del"],title:nbText["Del det, du ikke bruger hver dag"],description:nbText["Med Circle Plus kan du oprette op til 20 aktive annoncer og vælge gratis udlån eller betalt udlejning."],points:[nbText["180 dage gratis for nye, berettigede Circle Plus-kunder."],nbText["Derefter 49 DKK/md. i Danmark eller 69 SEK/md. i Sverige."],nbText["Ingen provision til Veyro Circle af jeres private lejeaftale."]],note:nbText["Du registrerer kort ved tilmelding. Abonnementet fortsætter automatisk efter prøven, medmindre du opsiger inden. Dit konkrete tilbud vises før tilmelding."]},
  ] };

export function CircleTourSlide({lang,step}:{lang:Lang;step:number}) {
  const slide=content[lang][step];
  const Icon=icons[step];
  return <section className="circle-tour-slide" aria-labelledby="circle-tour-step-title">
    <div className="circle-tour-illustration" aria-hidden="true"><span>{String(step+1).padStart(2,"0")}</span><Icon size={44}/><b>Veyro Circle</b></div>
    <h3 id="circle-tour-step-title">{slide.title}</h3>
    <p>{slide.description}</p>
    <ul>{slide.points.map(point=><li key={point}><Check size={17}/><span>{point}</span></li>)}</ul>
    <p className="circle-tour-note">{slide.note}</p>
  </section>;
}

export function CircleTour({lang}:{lang:Lang}) {
  const [open,setOpen]=useState(false);
  const [step,setStep]=useState(0);
  const da=lang==="da";
  return <Dialog open={open} onOpenChange={next=>{setOpen(next);if(next)setStep(0);}}>
    <DialogTrigger asChild><button type="button" className="auth-tour-link" aria-label={(lang === "nb" ? nbText["Se en kort rundvisning i Veyro Circle"] : (da?"Se en kort rundvisning i Veyro Circle":"Se en kort rundtur i Veyro Circle"))}><CirclePlay size={18}/>{(lang === "nb" ? nbText["Se rundvisning"] : (da?"Se rundvisning":"Se rundtur"))}</button></DialogTrigger>
    <DialogContent className="circle-tour-dialog" showCloseButton={false}>
      <DialogClose asChild><button type="button" className="circle-tour-close" aria-label={(lang === "nb" ? nbText["Luk rundvisning"] : (da?"Luk rundvisning":"Stäng rundturen"))}><X size={20}/></button></DialogClose>
      <DialogHeader><DialogTitle>{(lang === "nb" ? nbText["Sådan fungerer Veyro Circle"] : (da?"Sådan fungerer Veyro Circle":"Så fungerar Veyro Circle"))}</DialogTitle><DialogDescription>{(lang === "nb" ? nbText["En kort rundvisning. Du behøver ikke en konto."] : (da?"En kort rundvisning. Du behøver ikke en konto.":"En kort rundtur. Du behöver inget konto."))}</DialogDescription></DialogHeader>
      <ol className="circle-tour-progress" aria-label={(lang === "nb" ? nbText["Rundvisningens trin"] : (da?"Rundvisningens trin":"Rundturens steg"))}>{content[lang].map((slide,index)=><li key={slide.label} aria-current={index===step?"step":undefined} className={index<=step?"is-reached":""}><span>{index+1}</span>{slide.label}</li>)}</ol>
      <div aria-live="polite" aria-atomic="true"><CircleTourSlide lang={lang} step={step}/></div>
      <footer className="circle-tour-footer">
        <Button type="button" variant="outline" disabled={step===0} onClick={()=>setStep(value=>value-1)}><ArrowLeft size={17}/>{(lang === "nb" ? nbText["Tilbage"] : (da?"Tilbage":"Tillbaka"))}</Button>
        {step===3 ? <DialogClose asChild><Button type="button">{(lang === "nb" ? nbText["Afslut rundvisning"] : (da?"Afslut rundvisning":"Avsluta rundturen"))}<Check size={17}/></Button></DialogClose> : <Button type="button" onClick={()=>setStep(value=>value+1)}>{(lang === "nb" ? nbText["Næste"] : (da?"Næste":"Nästa"))}<ArrowRight size={17}/></Button>}
      </footer>
    </DialogContent>
  </Dialog>;
}
