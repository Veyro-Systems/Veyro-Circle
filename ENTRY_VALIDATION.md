# Login som startside, rundvisning og prisoplysning

Kontrolleret 21. oktober 2026.

## Ændring

- Nye besøgende på `/` får login-siden med den eksisterende branding og trailerillustration. Allerede indloggede brugere fortsætter i appen. Log ud fører tilbage til login-siden.
- `Se annoncer uden login` bevarer gæsteadgangen. Direkte links til konkrete annoncer åbner fortsat den offentlige annonce uden at kræve login.
- `Se rundvisning` åbner fire korte trin: find en ting, send en forespørgsel, lav en aftale og del dine egne ting. Den findes på dansk og svensk, har tilbage-/næsteknap, kan lukkes med Escape og starter forfra ved genåbning. Fokus vender tilbage til linket efter lukning.
- Login-siden, rundvisningen og prisboksen oplyser **180 dage gratis for nye, berettigede Circle Plus-kunder**, efterfulgt af 49 DKK/md. i Danmark eller 69 SEK/md. i Sverige. Kortregistrering, automatisk fortsættelse og opsigelse før første betaling er forklaret.
- Prisboksen giver generel information om tilbuddet. Et eksisterende abonnement eller manglende berettigelse vises særskilt; disse konti får ingen knap, som lover en ny prøveperiode. Personlige tilbud og Checkout anvender fortsat serverens kontrol af abonnementshistorik.
- På mobil vises login-formularen før den længere produktintroduktion. Desktop bevarer introduktionen til venstre og login til højre.

Der er ingen ændringer i Firebase-data, brugerprofiler, abonnementshistorik, Stripe Checkout-/webhookregler, priser, API-nøgler eller Netlify-opsætning.

## Kontroller

- `npm test`: **157 bestået, 0 fejlet**, inklusive Next.js-produktionsbuild og TypeScript.
- `npm run lint`: **exit 0**, ingen fejl og de samme 12 eksisterende `<img>`-advarsler.
- `git diff --check`: bestået.
- Det afsluttende build/test blev kørt med adgang til lokale hjælpeprocesser, efter Windows-sandboxen afbrød Turbopacks PostCSS-hjælpeproces. Der kræves ingen ændring af produktionskonfigurationen.

De nye automatiserede kontroller renderer den rigtige startside med en isoleret autentifikationsgrænse: gæster får login-siden, mens en indlogget bruger fortsætter i appen. De dækker også alle fire rundvisningstrin i begge sprog samt prisboksens generelle tilbud, berettigede kunder, ukendt berettigelse og eksisterende abonnementer. De eksisterende server- og Stripe-tests er bevaret.

Browserkontrol i en isoleret lokal forhåndsvisning uden Firebase-login eller rigtige kundedata:

- Desktop og mobilstørrelser 390 × 844 og 360 × 800.
- Alle fire trin på dansk og svensk; tilbage, afslutning, genåbning, Escape og fokusretur.
- Gæsteadgang, tilbage til login fra prisboksens tilbudslink og direkte annoncelink.
- Glemt adgangskode viser fortsat nulstillingsformularen.
- Ingen vandret overflow på mobil. Formular og dialog kan rulles på korte skærme.

Skærmbilleder og logs ligger lokalt uden for Git i `../validation/`. De indeholder ingen rigtige kundedata. Mobilkontrollen bruger Chrome-viewports, ikke fysiske telefoner eller Safari.

## Filer og publicering

- `app/page.tsx`: standardindgang, log ud, direkte annoncelinks og prisboks.
- `components/circle-auth.tsx`: login-layout, prøveoplysning og rundvisningslink.
- `components/circle-tour.tsx`: tilgængelig rundvisning i fire trin.
- `components/circle-pricing-info.tsx`: generel prisoplysning og særskilt kontostatus.
- `app/globals.css`: layout, tilbudsfremhævning og responsive dialoger.
- `tests/ui-components.test.mjs`: regressionstests for indgang, sprog og tilbud.

Udgivelsen bruger det eksisterende `main`-tilknyttede Netlify-site. Efter push kontrolleres, at Netlifys publicerede commit matcher `main`, at offentlige endpoints svarer korrekt, og at en anonym browser åbner login-siden. De konkrete deploy- og driftsresultater gemmes lokalt i `../operations/netlify-deployment-result.json` og `../operations/live-smoke-result.json`.
