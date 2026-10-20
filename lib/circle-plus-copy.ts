export const trialCopy={
  da:{headline:"Prøv Veyro Circle Plus gratis i 180 dage!",button:"Start 180 dage gratis",terms:"For nye Circle Plus-kunder. Efter prøveperioden fortsætter abonnementet automatisk til 49 DKK/md. i Danmark eller 69 SEK/md. i Sverige. Du registrerer betalingskort ved tilmelding og kan opsige før første betaling.",returning:"Din konto er ikke berettiget til en ny gratis prøveperiode.",card:"Du registrerer betalingskort hos Stripe ved tilmelding."},
  sv:{headline:"Prova Veyro Circle Plus gratis i 180 dagar!",button:"Starta 180 dagar gratis",terms:"För nya Circle Plus-kunder. Efter provperioden fortsätter prenumerationen automatiskt för 49 DKK/mån i Danmark eller 69 SEK/mån i Sverige. Du registrerar betalkort vid registreringen och kan säga upp före första betalningen.",returning:"Ditt konto är inte berättigat till en ny gratis provperiod.",card:"Du registrerar betalkort hos Stripe vid registreringen."},
};

export function circlePlusOffer(lang:"da"|"sv",country:"DK"|"SE",trialEligible:boolean) {
  const price=country==="SE"?"69 SEK":"49 DKK";
  const da=lang==="da";
  return {
    price,
    headline:trialEligible ? (da?"180 DAGE GRATIS":"180 DAGAR GRATIS") : price,
    priceLine:trialEligible ? (da?`Derefter ${price} om måneden`:`Därefter ${price} per månad`) : (da?"om måneden":"per månad"),
    payment:trialEligible ? (da?"Der trækkes først penge efter de 180 gratis dage.":"Pengar dras först efter de 180 gratis dagarna.") : (da?"Første betaling sker ved tilmelding.":"Första betalningen sker vid registreringen."),
    renewal:trialEligible ? (da?`Efter de 180 gratis dage fortsætter abonnementet automatisk til ${price} om måneden, medmindre du opsiger inden.`:`Efter de 180 gratis dagarna fortsätter prenumerationen automatiskt för ${price} per månad, om du inte säger upp den innan dess.`) : (da?`Abonnementet fornyes automatisk til ${price} om måneden, indtil du opsiger.`:`Prenumerationen förnyas automatiskt för ${price} per månad tills du säger upp den.`),
  };
}
