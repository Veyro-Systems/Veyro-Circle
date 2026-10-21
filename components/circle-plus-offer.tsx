"use client";
import { nbText } from "@/lib/norwegian-copy";


import { Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { circlePlusOffer, trialCopy } from "@/lib/circle-plus-copy";

type Props={lang:"da" | "sv" | "nb";country:"DK" | "SE" | "NO";trialEligible:boolean|null;hasSubscription:boolean;busy:boolean;error?:boolean;onContinue:()=>void;onRetry:()=>void;onClose:()=>void};

export function CirclePlusOffer({lang,country,trialEligible,hasSubscription,busy,error,onContinue,onRetry,onClose}:Props) {
  const da=lang==="da";
  const offer=circlePlusOffer(lang,country,trialEligible===true);
  const ready=trialEligible!==null;
  return <div className="circle-plus-offer">
    {hasSubscription ? <p className="plus-existing">{(lang === "nb" ? nbText["Du har allerede et abonnement. Administrer det sikkert hos Stripe."] : (da?"Du har allerede et abonnement. Administrer det sikkert hos Stripe.":"Du har redan en prenumeration. Hantera den säkert hos Stripe."))}</p> : !ready ? <div className="plus-offer-status" role={error?"alert":"status"}>{error ? <><p>{(lang === "nb" ? nbText["Din pris kunne ikke kontrolleres. Prøv igen."] : (da?"Din pris kunne ikke kontrolleres. Prøv igen.":"Ditt pris kunde inte kontrolleras. Försök igen."))}</p><Button variant="outline" onClick={onRetry}>{(lang === "nb" ? nbText["Prøv igen"] : (da?"Prøv igen":"Försök igen"))}</Button></> : <><LoaderCircle size={20} className="animate-spin"/><span>{(lang === "nb" ? nbText["Kontrollerer dit abonnement…"] : (da?"Kontrollerer dit abonnement…":"Kontrollerar din prenumeration…"))}</span></>}</div> : <>
      <div className={`upgrade-price plus-offer-price ${trialEligible?"is-trial":""}`}>
        <strong>{offer.headline}</strong><span>{offer.priceLine}</span>
        <small>{offer.payment}</small>
      </div>
      {!trialEligible && <p className="plus-ineligible">{trialCopy[lang].returning}</p>}
    </>}
    <ul className="upgrade-benefits">
      <li><Check size={18}/>{(lang === "nb" ? nbText["Op til 20 aktive ting"] : (da?"Op til 20 aktive ting":"Upp till 20 aktiva saker"))}</li>
      <li><Check size={18}/>{(lang === "nb" ? nbText["Gratis deling og betalt udlejning"] : (da?"Gratis deling og betalt udlejning":"Gratis delning och betald uthyrning"))}</li>
      <li><Check size={18}/>{(lang === "nb" ? nbText["Ingen provision"] : (da?"Ingen provision":"Ingen provision"))}</li>
    </ul>
    {ready&&!hasSubscription && <p className="plus-offer-terms">{offer.renewal} {trialCopy[lang].card} {(lang === "nb" ? nbText["Stripe viser betalingsdatoen, før du bekræfter."] : (da?"Stripe viser betalingsdatoen, før du bekræfter.":"Stripe visar betalningsdatumet innan du bekräftar."))}</p>}
    <Button disabled={busy||(!hasSubscription&&!ready)} className="plus-offer-cta" onClick={onContinue}>
      {busy ? ((lang === "nb" ? nbText["Åbner Stripe…"] : (da?"Åbner Stripe…":"Öppnar Stripe…"))) : hasSubscription ? ((lang === "nb" ? nbText["Administrer abonnement"] : (da?"Administrer abonnement":"Hantera prenumeration"))) : !ready ? ((lang === "nb" ? nbText["Kontrollerer abonnement…"] : (da?"Kontrollerer abonnement…":"Kontrollerar prenumeration…"))) : trialEligible ? trialCopy[lang].button : ((lang === "nb" ? nbText["Køb Circle Plus"] : (da?"Køb Circle Plus":"Köp Circle Plus")))}
    </Button>
    <button type="button" className="plus-offer-dismiss" disabled={busy} onClick={onClose}>{(lang === "nb" ? nbText["Ikke nu"] : (da?"Ikke nu":"Inte nu"))}</button>
  </div>;
}
