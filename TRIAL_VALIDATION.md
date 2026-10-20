# Circle Plus: 180 dages gratis prøveperiode

Kontroldato: 20. oktober 2026 (Europe/Copenhagen).

## Implementering

- Hero, registrering, Plus-dialog og abonnementsvisning forklarer tilbuddet på dansk og svensk. Efter 180 dage fortsætter abonnementet automatisk til 49 DKK/md. i Danmark eller 69 SEK/md. i Sverige. Kort registreres hos Stripe; opsigelse før prøvens udløb undgår første betaling.
- Checkout bruger `subscription_data[trial_period_days]=180` for nye Circle Plus-kunder og `payment_method_collection=always`. Det eksisterende valg af `STRIPE_PRICE_DKK`/`STRIPE_PRICE_SEK` er bevaret.
- Berettigelse kontrolleres på serveren ud fra permanent profilhistorik og alle relevante Stripe-kunder på den verificerede e-mail. Også opsagte abonnementer og pensionerede priser på samme Circle Plus-produkt tæller. Andre Veyro-produkter tæller ikke.
- En Firestore-lås pr. UID, genbrug af åbne Checkout-sessioner og Stripe-idempotens begrænser dobbelttilmeldinger. En session i forkert valuta udløbes, hvis profillandet er ændret.
- Kun `404/resource_missing` eller en slettet Stripe-kunde tillader erstatning af et gammelt Sandbox-kunde-ID. Rettighedsfejl og driftsfejl stopper tilmeldingen.
- Signerede webhooks henter abonnementets aktuelle Stripe-status. `trialing` og `active` giver fuld Plus-adgang. Opsigelse ved periodens slutning bevarer adgang indtil slutdatoen; afsluttet opsigelse og manglende betaling opdaterer adgangen efter den aktuelle status. Forsinkede hændelser fra et gammelt abonnement ændrer ikke et nyere aktivt abonnement.
- Live/Sandbox-hændelser holdes adskilt, og hændelser for andre produkter ignoreres. Abonnementer opdateres aldrig i Stripe som led i denne kodeændring. Profilopdateringer bruger feltmasker og versionskontrol og bevarer kontakt- og identitetsoplysninger.

## Automatiseret validering

`npm test` omfatter Next-produktionsbuild og hele testsuiten. Nye tests kører de rigtige Checkout-/webhookfunktioner med simulerede HTTP-grænser. De dækker begge valutaer, 180 dage, betalingsregistrering, historik, paginering, andre produkter, Sandbox-ID'er, samtidighed, retries, opsigelse, første faktura, betalingsfejl, signaturer og bevaring af profilfelter/historik. Render-tests dækker dansk og svensk abonnementsvisning.

Testopsætningen er rettet til Next-buildens `.next`-artefakter og Windows-stier/linjeskift. Vites testservere starter ikke kolliderende WebSockets. Produktionsbuildens Turbopack-rod er selve repositoryet.

- `npm test`: **148 bestået, 0 fejlet**; inklusive den endelige Next-produktionsbuild.
- `npm run lint`: **exit 0**, 0 fejl og 12 eksisterende advarsler om `<img>`.
- `npm run build`: **exit 0**. Den afsluttende build af ændringen bestod også via `npm test`.
- `git diff --check`: bestået.

## Stripe Sandbox

Sandbox: `acct_1Tvn9bLK5NGqmEIh`, tilgået via Stripe Dashboards Shell. Den tilsluttede MCP-konto viste kun Live; browseren gav adgang til den eksisterende separate Sandbox.

- Test Clock: `clock_1USj6JLK5NGqmEIhFkRr0ZTm`.
- Ny isoleret testpris: `price_1USj77LK5NGqmEIhfIKaFQZf`, 4900 øre DKK pr. måned. Eksisterende priser blev ikke ændret.
- Testkunde: `cus_VTgU6p0i5YPFvD`, med Stripes testbetalingsmetode `pm_card_visa`.
- Betalingsscenario: `sub_1USj8rLK5NGqmEIhAFlppuVa`.
- Opsigelsesscenario: `sub_1USj9qLK5NGqmEIhNdBUDEyQ`.
- Verificeret udgangspunkt: `livemode=false`, `status=trialing`, `collection_method=charge_automatically`, og `(trial_end-trial_start)/86400=180`.
- Start: Unix `1792526400`. Prøvens slutning: Unix `1808078400`.
- Test Clocks tillader højst to månedlige intervaller pr. spring. Uret fremrykkes derfor i trin på 45 dage.
- Uret blev fremrykket til Unix `1808085600`, to timer efter prøvens slutning, så Stripe selv kunne færdiggøre og betale første faktura.
- **Første automatiske betaling bestået:** faktura `in_1USjE4LK5NGqmEIhFl4nklrV`, `status=paid`, `amount_paid=4900`, `currency=dkk`, `collection_method=charge_automatically`, `livemode=false`.
- **Opsigelse før første betaling bestået:** opsigelsesscenariet fik `cancel_at_period_end=true` under prøven og kun en nul-faktura (`in_1USj9rLK5NGqmEIhL7fzTibx`); ingen positiv abonnementsfaktura efter dag 180.
- Efter fremrykningen blev betalingsscenariets status kontrolleret som `active` og opsigelsesscenariets status som `canceled`. Begge beholdt prøvehistorik på 180 dage.
- En rigtig Checkout-session i Sandbox accepterede kombinationen `subscription_data[trial_period_days]=180` og `payment_method_collection=always`; sidstnævnte blev også kontrolleret i sessionens API-svar.

Dette Stripe-scenario verificerer prøvens tidsforløb og automatisk opkrævning i Sandbox. Applikationens autentifikation, berettigelse, Checkout-parametre og webhooktilstande dækkes separat af de automatiserede tests. Ingen Sandbox-hændelser sendes til produktions-Firestore.
Det faktiske tidsforløb er afprøvet i DKK. Valg af SEK/69 SEK er dækket af de automatiserede Checkout-tests og den læsebaserede kontrol af den eksisterende Live-pris.

## Live-konfiguration og udgivelse

Kontrolleret læsebaseret før udgivelse:

- Netlify-site: `veyro-circle` (`d5e5a487-f822-43b7-a4d6-0cf21d973951`), Firebase-projekt `veyro-circle`.
- `STRIPE_PRICE_DKK=price_1UShHhLn6dV7DIk4QLCZ8Zd5`: aktiv Live-pris, 49 DKK/md.
- `STRIPE_PRICE_SEK=price_1UShHhLn6dV7DIk4C31veoXs`: aktiv Live-pris, 69 SEK/md.
- Eksisterende kundeportal tillader opsigelse ved periodens slutning uden proratering og opdatering af betalingsmetode.
- Eksisterende webhook-endpoint: `we_1USi3KLn6dV7DIk4GaOLBb4w`, API-version `2026-08-26.dahlia`.

Efter godkendte kontroller skal den eksisterende webhook-hændelsesliste suppleres med `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.paid` og `invoice.payment_failed`. De tre eksisterende hændelser bevares. URL, API-version og signing secret bevares.

Ingen API-nøgler, webhook-secrets, produktpriser eller skatteindstillinger ændres. Alle backups fra dataoprydning ligger uden for repositoryet og skal aldrig med i en commit.
