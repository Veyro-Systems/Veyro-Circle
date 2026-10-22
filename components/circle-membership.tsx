import {Crown} from "lucide-react";
import {Button} from "@/components/ui/button";
import {CirclePlusOffer} from "./circle-plus-offer";
import {membershipCopy,freeEndLabel} from "@/lib/membership-copy";
import {listingLimit,type ListingPlan} from "@/lib/listing-limits";
import type {CircleAccess} from "@/lib/circle-access";
import {locales,type Lang,type Country} from "@/lib/region";
type Details={trialEligible:boolean|null;hasSubscription:boolean;status:string;trialEnd?:string;cancelAtPeriodEnd:boolean;country?:Country;access?:CircleAccess};
export function CircleMembership({lang,plan,billingDetails,used,onBack,onUpgrade,onManage}:{lang:Lang;plan:ListingPlan;billingDetails:Details;used:number;onBack:()=>void;onUpgrade:()=>void;onManage:()=>void}) {
 const c=membershipCopy[lang],access=billingDetails.access,trialing=billingDetails.status==="trialing",end=billingDetails.trialEnd?new Date(billingDetails.trialEnd).toLocaleDateString(locales[lang],{timeZone:"Europe/Copenhagen"}):"";
 const legacy=lang==="da"?{trial:"Gratis prøveperiode",cancel:"Prøveperioden er opsagt",noCharge:"Der opkræves ingen abonnementsbetaling, når den opsagte prøveperiode slutter.",ends:"Adgang til",renew:"Næste betaling"}:lang==="sv"?{trial:"Gratis provperiod",cancel:"Provperioden är uppsagd",noCharge:"Ingen prenumerationsavgift tas ut när den uppsagda provperioden slutar.",ends:"Åtkomst till",renew:"Nästa betalning"}:{trial:"Gratis prøveperiode",cancel:"Prøveperioden er sagt opp",noCharge:"Ingen abonnementsbetaling kreves når den oppsagte prøveperioden slutter.",ends:"Tilgang til",renew:"Neste betaling"};
 return <div className="content-panel subscription-page"><button className="text-link" onClick={onBack}>← {c.back}</button><h1 className="page-title">{c.account}</h1><section className={`membership-card ${plan==="plus"?"is-plus":""}`}>
  <div className="membership-top"><Crown size={22}/><h2>{plan==="plus"?"Veyro Circle Plus":c.plan}</h2><span className="plan-badge">{trialing?legacy.trial:plan==="plus"?c.active:plan==="free"?"0 kr.":c.expired}</span></div>
  <div className="membership-usage"><span>{c.used}</span><b>{used} / {listingLimit(plan)}</b></div>
  {plan==="plus"?<><p>{c.already}</p><p>{c.twenty}</p>{trialing&&<p>{billingDetails.cancelAtPeriodEnd?legacy.cancel:legacy.trial}</p>}{end&&<p>{billingDetails.cancelAtPeriodEnd?legacy.ends:legacy.renew}: {end}</p>}{trialing&&billingDetails.cancelAtPeriodEnd&&<p>{legacy.noCharge}</p>}<Button onClick={onManage}>{c.manage}</Button></>:<>{access?.freeUntil&&<p>{c.until}: {freeEndLabel(access.freeUntil,lang)}</p>}<CirclePlusOffer lang={lang} country={billingDetails.country??"DK"} trialEligible={billingDetails.trialEligible} hasSubscription={billingDetails.hasSubscription} access={access} busy={false} onContinue={billingDetails.hasSubscription?onManage:access?.paymentRequired?onUpgrade:onBack} onRetry={onUpgrade} onClose={onBack}/></>}
 </section></div>;
}
