import {membershipCopy,membershipPrice} from "./membership-copy";
import type {Lang,Country} from "./region";
export const PLUS_OFFER_VERSION=5;
export function circlePlusOffer(lang:Lang,country:Country) {
 const c=membershipCopy[lang],price=membershipPrice(country),period=lang==="da"?"om måneden":lang==="sv"?"per månad":"i måneden";
 return {price,headline:price,priceLine:period,payment:c.payment,renewal:`${price} ${period}. ${c.renewal}`};
}
