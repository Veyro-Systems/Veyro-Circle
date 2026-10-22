import {membershipCopy,membershipPrice} from "./membership-copy";
import type {Lang,Country} from "./region";
export const trialCopy=Object.fromEntries(Object.entries(membershipCopy).map(([lang,c])=>[lang,{headline:c.headline,button:c.signup,terms:c.terms,returning:c.expired,card:c.payment}])) as Record<Lang,{headline:string;button:string;terms:string;returning:string;card:string}>;
export function circlePlusOffer(lang:Lang,country:Country,trialEligible:boolean) {
 const c=membershipCopy[lang],price=membershipPrice(country),period=lang==="da"?"om måneden":lang==="sv"?"per månad":"i måneden";
 return {price,headline:trialEligible?c.headline:price,priceLine:trialEligible?c.five:period,payment:trialEligible?c.freeNote:c.payment,renewal:trialEligible?c.terms:`${price} ${period}. ${c.renewal}`};
}
