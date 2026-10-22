import {membershipCopy} from "@/lib/membership-copy";
import type {Lang} from "@/lib/region";
export function CirclePricingInfo({lang,hasSubscription,onOffer}:{lang:Lang;trialEligible:boolean|null;hasSubscription:boolean;onOffer:()=>void}) {
 const c=membershipCopy[lang];
 return <div className="sharing-info"><h2>{c.kicker}</h2><div className="sharing-trial"><strong>{c.headline}</strong><p>{c.five}</p></div><p className="sharing-terms">{c.terms}</p><p>{c.commission}</p>{hasSubscription?<p>{c.already}</p>:<button type="button" className="sharing-offer-link" onClick={onOffer}>{c.view}</button>}</div>;
}
