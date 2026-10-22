"use client";
import {Check,LoaderCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {circlePlusOffer} from "@/lib/circle-plus-copy";
import {membershipCopy} from "@/lib/membership-copy";
import type {CircleAccess} from "@/lib/circle-access";
import type {Lang,Country} from "@/lib/region";
type Props={lang:Lang;country:Country;trialEligible:boolean|null;hasSubscription:boolean;access?:CircleAccess;busy:boolean;error?:boolean;onContinue:()=>void;onRetry:()=>void;onClose:()=>void};
export function CirclePlusOffer({lang,country,trialEligible,hasSubscription,access,busy,error,onContinue,onRetry,onClose}:Props) {
 const c=membershipCopy[lang],offer=circlePlusOffer(lang,country),ready=trialEligible!==null&&!!access;
 return <div className="circle-plus-offer">
  {hasSubscription?<p className="plus-existing">{c.already}</p>:!ready?<div className="plus-offer-status" role={error?"alert":"status"}>{error?<><p>{c.error}</p><Button variant="outline" onClick={onRetry}>{c.retry}</Button></>:<><LoaderCircle size={20} className="animate-spin"/><span>{c.unknown}</span></>}</div>:<>
   <div className="upgrade-price plus-offer-price"><strong>{offer.headline}</strong><span>{offer.priceLine}</span><small>{c.optional}</small></div>
   <p>{c.plusNote}</p>
  </>}
  <ul className="upgrade-benefits">{[c.twenty,c.sharing,c.commission].map(item=><li key={item}><Check size={18}/>{item}</li>)}</ul>
  {ready&&!hasSubscription&&<p className="plus-offer-terms">{offer.payment} {offer.renewal}</p>}
  <Button disabled={busy||(!hasSubscription&&!ready)} className="plus-offer-cta" onClick={onContinue}>{busy?<LoaderCircle className="animate-spin" size={20}/>:hasSubscription?c.manage:!ready?c.unknown:c.upgrade}</Button>
  <button type="button" className="plus-offer-dismiss" disabled={busy} onClick={onClose}>{hasSubscription?c.later:c.continueFree}</button>
 </div>;
}
