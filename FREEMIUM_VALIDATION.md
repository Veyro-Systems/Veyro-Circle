# Permanent gratisordning og frivillig Circle Plus

Historisk dokument for udgivelsen 22. oktober 2026. Ordningen er erstattet af [180 dage uden kort](CARD_FREE_180_RESTORATION.md); teksten nedenfor beskriver den tidligere udgivelse.

22. oktober 2026.

## Ordning

- Gratis: op til 5 aktive ting uden tidsgrænse eller betalingskort. Søgning, forespørgsler og aftaler kræver ikke Plus.
- Frivillig Plus: op til 20 aktive ting, 29 DKK / 43 SEK / 41 NOK pr. måned. Første betaling ved aktiv tilmelding hos Stripe, derefter månedlig fornyelse indtil opsigelse.
- Eksisterende aktive abonnementer og gamle Stripe-prøver beholder deres aftalte vilkår. Denne udgivelse ændrer ingen Stripe-kontrakter eller priser.
- Efter Plus ophører giver kontoen fortsat 5 gratis pladser. Overskydende annoncer skjules fra den offentlige feed uden sletning. Alle ejerens annoncer er fortsat tilgængelige på kontoen. Aftaler, beskeder, billeder, profil og login bevares.
- Gamle gratisperiodedatoer og abonnementshistorik bevares. Gratisadgang afhænger ikke længere af datoerne. Ingen datamigrering er nødvendig.

## Implementering

Serverens fælles adgangsregler og annoncegrænser styrer adgang. Klientdata kan ikke tildele Plus eller omgå grænsen. Samtidige oprettelser håndhæves atomisk. Verificerede Stripe-webhooks styrer Plus-status; `active` og eksisterende `trialing` giver Plus, mens bl.a. `past_due` og `canceled` giver gratisniveauet.

Automatiske betalingsprompter ved gratisperiodens udløb er fjernet. Checkout kan kun startes ved brugerens aktive Plus-valg. Tilbudsversion 4 kræves på serveren, så en gammel klient med de tidligere tvungne betalingsvilkår afvises før oprettelse af Stripe-ressourcer. Beskyttelse mod dubletter, samtidige klik, tabte svar og forkerte kundereferencer bevares.

App, login/tilmelding, rundvisning, prisboks, abonnementsside og vilkår er opdateret på dansk, svensk og norsk. Svenske juridiske links fører nu til `/legal/sv`.

## Kontroller

`npm test` omfatter `npm run build` og hele det automatiserede testsæt. Testene dækker permanent gratisadgang for nye og gamle konti, manglende historiske datoer, serverbeskyttede profilfelter, 5/20-grænser, samtidige oprettelser, nedgradering uden datatab, alle tre valutaer, frivilligt Checkout, gamle klienter, dubletbeskyttelse, opsigelse, betaling, betalingsfejl, webhook-signatur og adskillelse af Live/Sandbox. Byggede vilkårssider kontrolleres på alle tre sprog.

`npm run lint` har ingen fejl; de 12 eksisterende advarsler ved almindelige billedtags er uændrede.

Browserkontrol af de faktiske komponenter ved 375 × 812 og 412 × 915: tydelig frivillig Plus, korrekt DKK/SEK/NOK-pris, mulighed for at fortsætte gratis og ingen vandret afskæring. Det er emulerede mobilstørrelser, ikke test på fysiske telefoner.

## Stripe

De eksisterende Live-priser er læst og verificeret uden ændringer:

| Land | Pris | Live-pris-ID |
| --- | --- | --- |
| Danmark | 29 DKK pr. måned | `price_1UTGRTLn6dV7DIk4jSwfPE9u` |
| Sverige | 43 SEK pr. måned | `price_1UTGRWLn6dV7DIk4vCJ71VIn` |
| Norge | 41 NOK pr. måned | `price_1UTGRZLn6dV7DIk43Y5VPRoU` |

Alle tre er aktive månedspriser på produktet Veyro Circle Plus og uden Stripe-prøveperiode. Momsopsætning, API-nøgler og webhook-secret er ikke ændret. Historiske priser er bevaret til eksisterende kontrakter.

En ny Checkout-session er oprettet i den isolerede Sandbox `acct_1Tvn9bLK5NGqmEIh`. Stripe accepterede `integration_identifier`, dynamiske betalingsmetoder og `payment_method_collection=always`. Sessionen viser 29 DKK til betaling nu for frivillig Plus og månedlig fornyelse; ingen gratisperiode eller automatisk tilmelding fra gratisniveauet. Ingen betaling er gennemført i denne udgivelses kontrol, og ingen Live-betaling er brugt til test. Betalings- og opsigelsesforløb dækkes af de automatiserede tests; tidligere Sandbox-kontrol af første 29 DKK-faktura er bevaret i projektets lokale valideringsmateriale.

## Udgivelse

Udgives fra `main` til det eksisterende Netlify-site `veyro-circle.netlify.app`. Efter push kontrolleres Netlifys publicerede commit, offentlige sider og API-sikkerhed samt den eksisterende kontos gratisabonnement. Præcis commit, deploy-ID og efterkontrol gemmes i den lokale udgivelseskvittering sammen med skærmbilleder og testlogs. Ingen produktionsdata skal ændres som del af udgivelsen.
