
import { nbText } from "@/lib/norwegian-copy";
import { regions } from "@/lib/region";
export const trialCopy={
  da:{headline:"Prøv Veyro Circle Plus gratis i 180 dage!",button:"Start 180 dage gratis",terms:"For nye Circle Plus-kunder. Efter prøveperioden fortsætter abonnementet automatisk til 49 DKK/md. i Danmark, 69 SEK/md. i Sverige eller 69 NOK/md. i Norge. Du registrerer betalingskort ved tilmelding og kan opsige før første betaling.",returning:"Din konto er ikke berettiget til en ny gratis prøveperiode.",card:"Du registrerer betalingskort hos Stripe ved tilmelding."},
  sv:{headline:"Prova Veyro Circle Plus gratis i 180 dagar!",button:"Starta 180 dagar gratis",terms:"För nya Circle Plus-kunder. Efter provperioden fortsätter prenumerationen automatiskt för 49 DKK/mån i Danmark, 69 SEK/mån i Sverige eller 69 NOK/mån i Norge. Du registrerar betalkort vid registreringen och kan säga upp före första betalningen.",returning:"Ditt konto är inte berättigat till en ny gratis provperiod.",card:"Du registrerar betalkort hos Stripe vid registreringen."},
 nb: {headline:nbText["Prøv Veyro Circle Plus gratis i 180 dage!"],button:nbText["Start 180 dage gratis"],terms:nbText["For nye Circle Plus-kunder. Efter prøveperioden fortsætter abonnementet automatisk til 49 DKK/md. i Danmark eller 69 SEK/md. i Sverige. Du registrerer betalingskort ved tilmelding og kan opsige før første betaling."],returning:nbText["Din konto er ikke berettiget til en ny gratis prøveperiode."],card:nbText["Du registrerer betalingskort hos Stripe ved tilmelding."]} };

export function circlePlusOffer(lang:"da" | "sv" | "nb",country:"DK" | "SE" | "NO",trialEligible:boolean) {
  const price=`${regions[country].monthlyPrice} ${regions[country].currency}`;
  const da=lang==="da";
  return {
    price,
    headline:trialEligible ? ((lang === "nb" ? nbText["180 DAGE GRATIS"] : (da?"180 DAGE GRATIS":"180 DAGAR GRATIS"))) : price,
    priceLine:trialEligible ? ((lang === "nb" ? `Deretter ${price} i måneden` : (da?`Derefter ${price} om måneden`:`Därefter ${price} per månad`))) : ((lang === "nb" ? nbText["om måneden"] : (da?"om måneden":"per månad"))),
    payment:trialEligible ? ((lang === "nb" ? nbText["Der trækkes først penge efter de 180 gratis dage."] : (da?"Der trækkes først penge efter de 180 gratis dage.":"Pengar dras först efter de 180 gratis dagarna."))) : ((lang === "nb" ? nbText["Første betaling sker ved tilmelding."] : (da?"Første betaling sker ved tilmelding.":"Första betalningen sker vid registreringen."))),
    renewal:trialEligible ? ((lang === "nb" ? `Etter de 180 gratis dagene fortsetter abonnementet automatisk til ${price} i måneden med mindre du sier opp innen prøveperioden utløper.` : (da?`Efter de 180 gratis dage fortsætter abonnementet automatisk til ${price} om måneden, medmindre du opsiger inden.`:`Efter de 180 gratis dagarna fortsätter prenumerationen automatiskt för ${price} per månad, om du inte säger upp den innan dess.`))) : ((lang === "nb" ? `Abonnementet fornyes automatisk til ${price} i måneden til du sier opp.` : (da?`Abonnementet fornyes automatisk til ${price} om måneden, indtil du opsiger.`:`Prenumerationen förnyas automatiskt för ${price} per månad tills du säger upp den.`))),
  };
}
