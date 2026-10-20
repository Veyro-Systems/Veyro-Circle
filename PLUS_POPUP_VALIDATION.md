# Circle Plus: popup og sikkert tilbud før Checkout

Kontroldato: 20. oktober 2026. Dette er en lokal opfølgning på den tidligere 180-dages implementering i `1d45af9`. **Ingen push, merge eller Netlify-deploy i denne opfølgning.** Udgivelse afventer brugerens godkendelse.

## Resultat

- Berettigede kunder ser `180 DAGE GRATIS` / `180 DAGAR GRATIS`, den relevante efterfølgende pris (49 DKK eller 69 SEK), besked om ingen betaling før dag 180 og automatisk fortsættelse, medmindre de opsiger inden. Knappen er `Start 180 dage gratis` / `Starta 180 dagar gratis`.
- Popupen bevarer fordelene og det eksisterende designs farver. Kortregistrering og opsigelsesvilkår står samlet i et kompakt layout.
- Tilbuddet hentes fra serveren. Ukendt berettigelse viser kontrol eller fejl med mulighed for at prøve igen; intet gratis tilbud vises. Tidligere abonnenter ser normalprisen og en forklaring om manglende berettigelse. Aktive abonnenter sendes til den eksisterende kundeportal.
- Hero, registrering og abonnementsoversigt lover ikke automatisk en prøveperiode til en ukendt eller uberettiget bruger.
- Klienten sender det viste tilbuds berettigelse og land tilbage som en forventning. Serveren kontrollerer igen mod Firebase- og Stripe-historik. Ved ændringer returneres `409 BILLING_OFFER_CHANGED`, så kunden skal se tilbuddet igen. Klientdata kan hverken give en prøveperiode eller vælge produktprisen.
- Checkout har dansk/svensk sprog og de samme pris- og opsigelsesvilkår som popupen. Stripe viser den konkrete første betalingsdato før bekræftelse.
- Nye Checkout-sessioner bruger `payment_method_collection=always` og `payment_method_types[0]=card`. Sandbox-kontrollen viste, at automatisk valg af betalingsmetoder ellers kunne tilbyde Klarna. Ældre åbne sessioner med andre vilkår, sprog, valuta eller betalingsmetoder udløber før en ny session oprettes.

## Bevaret integration og data

Den eksisterende serverlogik i `lib/circle-billing.ts`, webhooken, Firebase-reglerne og Netlify-opsætningen er gennemgået og bevaret. Prøveperioden sættes fortsat pr. berettiget Checkout med `subscription_data[trial_period_days]=180`; ingen global prisændring er nødvendig i Stripe.

- Permanent abonnementshistorik og tidligere abonnementer på samme Circle Plus-produkt forhindrer gentagne prøveperioder. Historikken nulstilles ikke.
- `trialing` og `active` giver Plus-adgang. Opsigelse ved prøvens slutning bevarer adgang indtil slutdatoen. Betalingsfejl følger Stripes aktuelle abonnementstilstand via signaturverificerede server-events.
- Eksisterende aktive abonnementer opdateres ikke af Checkout. Lås pr. bruger, genbrug af sessioner og Stripe-idempotens er bevaret.
- Gamle Sandbox-kunde-ID'er håndteres fortsat kun som manglende ved en dokumenteret `404 resource_missing`. Rettighedsfejl og driftsfejl giver ingen ny kunde eller prøveperiode.
- Ingen produktionsprofiler, annoncer, låneaftaler, beskeder, adgangskonti eller abonnementer er ændret som led i valideringen.
- Ingen API-nøgler, webhook-secrets, eksisterende produktpriser eller Stripe Live-indstillinger er ændret.

Eksisterende Live-priser, læseverificeret tidligere i samme arbejdssession:

| Miljø | Pris-ID | Beløb |
| --- | --- | --- |
| Live Danmark | `price_1UShHhLn6dV7DIk4QLCZ8Zd5` | 49 DKK/måned |
| Live Sverige | `price_1UShHhLn6dV7DIk4C31veoXs` | 69 SEK/måned |

Begge eksisterende miljøvariabler `STRIPE_PRICE_DKK` og `STRIPE_PRICE_SEK` bevares. Ingen yderligere manuelle Live-ændringer er nødvendige for denne kodeændring. Den opdaterede popup og de nye Checkout-vilkår kommer først på produktionssiden efter en godkendt push og deploy.

## Automatiserede kontroller

- `npm test`: **154 bestået, 0 fejlet**. Kommandoen kører også `npm run build`; Next.js-produktionsbuild og TypeScript bestod.
- `npm run lint`: **exit 0**, 0 fejl og 12 eksisterende advarsler om `<img>`.
- `git diff --check`: bestået.

| Scenario | Dækning og resultat |
| --- | --- |
| Ny dansk og svensk kunde | Rigtige Checkout-routes med isolerede Firebase-/Stripe-doubles: 180 dage, serverens regionale pris, kortregistrering, sprog og korrekte vilkår. Bestået. |
| Tidligere abonnent | Permanent profilhistorik, pagineret Stripe-historik og pensionerede Circle Plus-priser. Ingen ny prøveperiode. Bestået. |
| Aktivt eller andet blokerende abonnement | Ingen ny Checkout eller ændring af abonnement. Bestået. |
| Tilbud ændret siden visning | Ingen Stripe-kunde/session oprettes; ingen omdirigering til et betalt alternativ. Bestået. |
| Dobbelte klik, samtidighed og tabt svar | Lås, idempotens og sessiongenbrug. Bestået. |
| Opsigelse inden betaling | `trialing` med planlagt ophør bevarer adgang; efter ophør fjernes adgang. Bestået. |
| Første faktura og betalingsfejl | Verificerede events henter aktuel Stripe-tilstand og synkroniserer adgang. Forkert miljø, signatur, produkt eller forældet abonnement afvises/ignoreres korrekt. Bestået. |
| Ukendt berettigelse og fejl | Ingen prøvepris eller aktiv tilmeldingsknap; fejl kan forsøges igen. Bestået. |
| Dansk og svensk rendering | Korrekte regionale priser, fordele, ordlyd og neutral visning for eksisterende abonnenter. Bestået. |

Tests bruger testværdier og isolerede doubles; de benytter ingen produktionsnøgler eller rigtige kundedata.

## Stripe Sandbox

Den eksisterende separate Sandbox `acct_1Tvn9bLK5NGqmEIh` blev brugt via Dashboard Shell. Den tilsluttede MCP-forbindelse eksponerede fortsat kun Live. Alle oprettede objekter nedenfor har `livemode=false`; ingen Sandbox-events er sendt til produktions-Firestore.

### Checkout før accept

Nye isolerede hosted Checkout-sessioner blev åbnet på dansk og svensk med de endelige parametre: 180 dages prøve, obligatorisk kort, korrekt valuta, sprog og `custom_text[submit][message]`.

- Dansk: `180 dage gratis`, derefter 49,00 kr. pr. måned fra og med **18. april 2027**, samt kortfelter og vilkår før `Begynd prøvetid`.
- Svensk: `180 dagar gratis`, derefter 69,00 kr. per månad fra og med **18 april 2027**, samt kortfelter og vilkår før `Starta provperiod`.
- Ingen Checkout blev accepteret som en Live-test. De isolerede visningssessioner blev ikke gennemført og opretter derfor ingen abonnementer.

### Svensk prøveperiode, første betaling og fejl

| Objekt | Identifikation/resultat |
| --- | --- |
| Ny isoleret svensk testpris | `price_1USjewLK5NGqmEIhHPMd5z2t`, 6900 øre SEK/måned, på det eksisterende testprodukt |
| Test Clock | `clock_1USjfPLK5NGqmEIhUdzVnDUk` |
| Isoleret testkunde | `cus_VTh33rxeIpCmok`, uden rigtig kundes e-mail |
| Abonnement | `sub_1USjgILK5NGqmEIhz4VlRJQz` |
| Start/slut | Unix `1792528190` til `1808080190`: præcis 180 dage, oprindelig status `trialing` |
| Første automatiske betaling | `in_1USjkGLK5NGqmEIhhEX4ikI8`: `paid`, `amount_paid=6900`, `currency=sek`, `collection_method=charge_automatically`, ét betalingsforsøg |
| Betalingsfejl ved næste fornyelse | `in_1USjmQLK5NGqmEIhjh1bIT66`: `open`, `amount_due=6900`, `amount_paid=0`, `attempted=true`, ét betalingsforsøg; abonnementets aktuelle status `past_due` |
| Verificeret Stripe-event | `evt_1USjmVLK5NGqmEIhWpnMsXEU`, `invoice.payment_failed`, API `2026-08-26.dahlia`, samme faktura, `livemode=false` |

Uret blev fremrykket i trin på 45 dage og derefter til to timer efter prøvens udløb, så Stripe automatisk færdiggjorde første faktura. Efter den vellykkede betaling blev kun den isolerede testkundes standardkort skiftet til Stripes afvisningstestkort, og uret blev fremrykket til næste månedlige fornyelse. Eksisterende test- og Live-kunder blev ikke ændret.

Den tidligere danske Test Clock-kontrol, dokumenteret i `TRIAL_VALIDATION.md`, bekræfter første automatiske betaling på 49 DKK efter 180 dage og opsigelse uden positiv faktura. Denne opfølgning supplerer med en reel svensk faktura og betalingsfejl.

De faktiske Stripe-tests og de automatiserede tests dækker forskellige grænser: tidsforløb/betaling kontrolleres i Sandbox; autorisation, berettigelse, Firebase-skrivninger og verificerede webhooks kontrolleres isoleret. Der er ikke gennemført et nyt samlet login-til-betaling-forløb mod produktions-Firebase.

## Mobil og desktop

Den rigtige `CirclePlusOffer`-komponent med projektets Dialog og CSS blev vist i en midlertidig lokal forhåndsvisning uden Firebase-adgang. Ingen debug-route er føjet til produktet.

- iPhone-størrelse: **390 × 844**, dansk/DKK.
- Android-størrelse: **360 × 800**, svensk/SEK.
- Desktop: **1280 × 800**.
- Ingen vandret overflow; pris, fordele, vilkår og CTA kunne ses samlet i begge mobilstørrelser. Fejltilstand og visning for tidligere abonnent blev også kontrolleret i browseren.
- Dette er viewport-kontrol i Chrome, ikke en fysisk iPhone-/Android-enhedstest eller en Safari-test.

Skærmbilleder ligger lokalt uden for repositoryet i `../validation/`: `plus-popup-iphone.png`, `plus-popup-android-sv.png`, `plus-popup-desktop.png`, `sandbox-sek-first-payment.png` og `sandbox-sek-payment-failed.png`.

## Ændrede filer

| Filer | Formål |
| --- | --- |
| `components/circle-plus-offer.tsx`, `app/globals.css` | Kompakt, responsiv Plus-popup og de forskellige berettigelsestilstande |
| `app/page.tsx`, `components/circle-auth.tsx` | Serververificeret tilbud, neutral registrering og opdateret abonnementsvisning |
| `lib/circle-plus-copy.ts` | Delt dansk/svensk pris- og vilkårstekst |
| `lib/billing-client.ts`, `app/api/stripe/checkout/route.ts` | Tilbudsbekræftelse, fejlhåndtering, sprog, vilkår og obligatorisk kort |
| `tests/billing-client.test.mjs`, `tests/billing-trial.test.mjs`, `tests/billing-foundation.test.mjs`, `tests/ui-components.test.mjs` | Regressionstests for det ændrede flow |
| `PLUS_POPUP_VALIDATION.md` | Denne leverings- og testrapport |
