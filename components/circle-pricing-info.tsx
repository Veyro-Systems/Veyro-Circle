
import { nbText } from "@/lib/norwegian-copy";
import { trialCopy } from "@/lib/circle-plus-copy";
import type { Lang } from "@/lib/marketplace";

export function CirclePricingInfo({lang,trialEligible,hasSubscription,onOffer}:{lang:Lang;trialEligible:boolean|null;hasSubscription:boolean;onOffer:()=>void}) {
  const da=lang==="da";
  return <div className="sharing-info">
    <h2>{(lang === "nb" ? nbText["Enkel og ærlig pris"] : (da?"Enkel og ærlig pris":"Enkelt och tydligt pris"))}</h2>
    <p><b>{(lang === "nb" ? nbText["Gratis at søge og forespørge"] : (da?"Gratis at søge og forespørge":"Gratis att söka och skicka förfrågningar"))}</b>{(lang === "nb" ? nbText["Det koster ikke noget at finde ting eller sende en forespørgsel."] : (da?"Det koster ikke noget at finde ting eller sende en forespørgsel.":"Det kostar inget att hitta saker eller skicka en förfrågan."))}</p>
    <div className="sharing-trial"><span>{(lang === "nb" ? nbText["For nye, berettigede Plus-kunder"] : (da?"For nye, berettigede Plus-kunder":"För nya, berättigade Plus-kunder"))}</span><strong>{(lang === "nb" ? nbText["180 dage gratis"] : (da?"180 dage gratis":"180 dagar gratis"))}</strong><p>{(lang === "nb" ? nbText["Circle Plus giver op til 20 aktive ting – både gratis deling og betalt udlejning."] : (da?"Circle Plus giver op til 20 aktive ting – både gratis deling og betalt udlejning.":"Circle Plus ger upp till 20 aktiva saker – både gratis delning och betald uthyrning."))}</p></div>
    <p className="sharing-renewal">{(lang === "nb" ? nbText["Derefter 49 DKK/md. i Danmark eller 69 SEK/md. i Sverige."] : (da?"Derefter 49 DKK/md. i Danmark, 69 SEK/md. i Sverige eller 69 NOK/md. i Norge.":"Därefter 49 DKK/mån i Danmark, 69 SEK/mån i Sverige eller 69 NOK/mån i Norge."))}</p>
    <p className="sharing-terms">{(lang === "nb" ? nbText["Kort registreres ved tilmelding. Abonnementet fortsætter automatisk efter prøveperioden. Opsig inden de 180 dage for at undgå første betaling."] : (da?"Kort registreres ved tilmelding. Abonnementet fortsætter automatisk efter prøveperioden. Opsig inden de 180 dage for at undgå første betaling.":"Kort registreras vid registreringen. Prenumerationen fortsätter automatiskt efter provperioden. Säg upp innan de 180 dagarna för att undvika första betalningen."))}</p>
    {hasSubscription ? <p className="sharing-account-note">{(lang === "nb" ? nbText["Du har allerede Circle Plus. Dit nuværende abonnement fortsætter som hidtil."] : (da?"Du har allerede Circle Plus. Dit nuværende abonnement fortsætter som hidtil.":"Du har redan Circle Plus. Din nuvarande prenumeration fortsätter som tidigare."))}</p> : trialEligible===false ? <p className="sharing-account-note">{trialCopy[lang].returning}</p> : <button type="button" className="sharing-offer-link" onClick={onOffer}>{trialEligible===true?trialCopy[lang].button:(lang === "nb" ? nbText["Se dit personlige tilbud"] : (da?"Se dit personlige tilbud":"Se ditt personliga erbjudande"))}</button>}
    <p className="muted">{(lang === "nb" ? nbText["Veyro Circle tager ingen provision af den private lejeaftale."] : (da?"Veyro Circle tager ingen provision af den private lejeaftale.":"Veyro Circle tar ingen provision på den privata hyresaffären."))}</p>
  </div>;
}
