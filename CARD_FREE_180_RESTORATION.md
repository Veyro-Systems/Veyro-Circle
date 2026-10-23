# 180 dage uden kort og offentlige udlejerprofiler

23. oktober 2026.

## Adgang og betaling

Op til 5 aktive ting i 180 dage fra den personlige, oprindelige oprettelsesdato. Intet kort, Stripe-kunde eller abonnement oprettes som del af gratis tilmelding. Efter udløbet vælger brugeren aktivt et abonnement til 29 DKK / 43 SEK / 41 NOK om måneden med op til 20 aktive ting. Første betaling sker ved dette valg; derefter fornyes abonnementet månedligt indtil opsigelse. Der er ingen automatisk overgang fra gratisperioden til betaling.

Serveren beregner adgangen fra beskyttede historiske felter. Eksisterende datoer og abonnementshistorik nulstilles ikke. Nye profilers startdato kommer fra verificeret Firebase Authentication-oprettelse; ældre profiler kan bruge dokumentets oprettelsestid. Manglende, fremtidige eller ugyldige datoer tildeler ikke gratis adgang.

Ved udløb sættes annoncer på pause uden sletning. Nye annoncer, efterlysninger og nye aftaler kræver betaling. Eksisterende aftaler kan fortsat gennemføres, beskeder og dokumentation bevares, og anmeldelser af gennemførte aftaler kan fortsat indsendes. Eksisterende aktive Stripe-abonnementer og Stripe-prøveabonnementer bevarer deres kontrakter og Plus-adgang.

Checkout afviser gratisperiodens brugere før nogen Stripe-ressource eller Checkout-lås oprettes. Efter udløbet kræves tilbudsversion 5, gældende land og eksplicit accept af betaling. Gamle klienter fra ordningen med permanent gratis adgang afvises med en besked om at genlæse tilbuddet. Idempotens, låse, dubletbeskyttelse, sikker håndtering af gamle Sandbox-ID'er og verificerede webhooks bevares.

Der bruges ikke `subscription_data[trial_period_days]`: de 180 dage er kortfri appadgang, ikke en Stripe-prøveperiode. Betalt Checkout giver ikke en ekstra prøveperiode. Et Stripe Test Clock må derfor ikke bruges som dokumentation for appens 180-dages adgangsberegning.

## Udlejerprofil og anmeldelser

En annonce linker til udlejerens offentlige profil. Kontoen har også en knap til egen offentlige profil. Profilen viser fornavn, by/land, samlet bedømmelse, antal anmeldelser og udlejerens aktuelt publicerbare, aktive ting. En ting kan åbnes fra profilen. Ingen nye profiler eller anmeldelsesdata migreres eller oprettes ved visning.

Den offentlige API bruger en eksplicit liste over tilladte felter. E-mail, telefon, privat adresse, betalingsoplysninger og aftaledokumenter udleveres ikke. Profilen følger samme serverberegnede 5/20/udløbet-regler som annoncelisten. Anmeldelser samles på udlejeren, også fra annoncer som senere er fjernet, uden at andre brugeres anmeldelser blandes ind.

Kun parter i en afsluttet aftale kan anmelde den, én gang pr. part. Eksisterende seksstjerneskala bevares; ældre femstjernede anmeldelser beholder deres oprindelige karakter og omregnes forholdsmæssigt i gennemsnittet. Eksemplets MitID-, forsikrings- og svartidsmærker er ikke implementeret uden dokumenteret grundlag.

## Kontroller

- `npm test`: bestået, inklusive produktionsbuild og 199 tests; ingen fejl, spring eller aflysninger.
- `npm run lint`: bestået med 0 fejl og 12 eksisterende advarsler om almindelige billedtags.
- TypeScript-kontrol og `git diff --check`: bestået.
- Tests dækker præcis 180 dage, datogrænser, historikbeskyttelse, serveradgang, 5/20-grænser, udløb uden datatab, alle tre priser, Checkout, gamle klienter, samtidighed, tabte svar, opsigelse, betaling, betalingsfejl og verificerede webhooks.
- Nye profiltests kontrollerer offentlige felter, aktive egne annoncer, ingen dataændringer, udløb og bevarede anmeldelser, ældre bedømmelser, ugyldigt UID og ukendt profil.
- Dansk, svensk og norsk tilbud samt byggede vilkårssider er kontrolleret. Browserkontrol ved 375 × 812 og 412 × 915 viser læsbare tilbud uden vandret afskæring. Annonce → udlejerprofil → anden annonce er kontrolleret med lokale eksempeldata. Dette er emulerede størrelser, ikke fysiske iPhone/Android-enheder.

Live-priser, produkter, API-nøgler, webhook-secrets, momsopsætning og eksisterende abonnementer er uændrede. Det eksplicit betalte Checkout med 29 DKK blev verificeret i Stripe Sandbox ved den foregående udgivelse; denne udgivelses API-regressioner bruger isolerede testdoubler. Ingen Live-betaling er udført som test. Der er ikke udført en ny reel Sandbox-opkrævning eller Test Clock-kørsel i denne udgivelse.

## Video og udgivelse

Den nye danske marketingvideo ligger uden for repository i `marketing/circle-tour/music-20s-180-days/`. Den er 20,00 sekunder, 480 billeder ved 24 fps, 1080 × 1920, H.264 med AAC-stereolyd fra brugerens sang. Slutkortet siger 180 dage gratis uden kort, op til 5 aktive ting, derefter 29 DKK/md. kun ved aktivt valg. Hele lyd- og billedsporet er dekodet uden fejl; originalvideoer og sang har uændrede SHA-256-hashes. Tidligere versioner med permanent gratis adgang er historiske og må ikke bruges som aktuelle tilbud.

Udgivelsen følger det eksisterende GitHub-main → Netlify-flow. Commit, Netlify-status og efterfølgende Live-kontrol gemmes som lokal udgivelseskvittering uden hemmeligheder. Ingen produktionsdatamigrering er nødvendig eller udført.
