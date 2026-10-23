# Ejerbesked ved nye tilmeldinger

En ny bruger udløser én besked til ejernes tilmeldte push-enheder efter bekræftet e-mail og første vellykkede oprettelse af Firestore-profilen. En fejlet oprettelse, genindsendelse, samtidig oprettelse eller senere profilrettelse udløser ikke en ekstra besked. Brugeren kan fortsat oprette sin konto, hvis push-tjenesten fejler.

Modtagere følger den eksisterende serverkonfiguration `CIRCLE_MAP_OWNER_UIDS` og `CIRCLE_MAP_OWNER_EMAILS`. `/api/push` afgør ejerskab ud fra den verificerede loginidentitet og gemmer det på enhedsregistreringen. Klienten kan ikke vælge ejere eller modtagere. Ved afsendelse kontrolleres tilladelseslisten igen, og en ændret, udløbet eller slettet enhedsregistrering udelades. Registreringerne og eventuelle ejermails er serverprivate under de eksisterende Firestore-regler.

Push-teksten er generisk og oversat til dansk, svensk og norsk. Den viser ikke den nye brugers navn, e-mail, telefon eller adresse. Linket åbner Circle uden kontoidentifikator. Der udsendes ikke beskeder bagud for eksisterende profiler.

Aktivering:

1. Firebase-projektet skal have et Web Push-certifikat under Project settings → Cloud Messaging → Web configuration. Genbrug et eksisterende nøglepar, hvis et findes.
2. Den offentlige nøgle skal sættes som `NEXT_PUBLIC_FIREBASE_VAPID_KEY` i Netlify med build-adgang. Den private nøgle skal blive i Firebase og må ikke indsættes i klientkode, repository eller logs.
3. Sæt `CIRCLE_PUSH_ENABLED=true` for produktionsfunktionerne, og byg siden igen. Firebase Cloud Messaging V1 skal være aktiveret, og servicekontoen skal kunne sende beskeder.
4. Jørn og Dennis skal logge ind med deres egne bekræftede ejeridentiteter, åbne klokken og vælge “Slå push til på denne enhed”. Browserens/enhedens tilladelse kræves på hver enhed. Eksisterende push-samtykke fornyes ved login/åbning af indstillinger.

Push bruger den eksisterende Firebase Cloud Messaging-integration. Levering afhænger af enhed, netværk og notifikationstilladelse; der er ingen kvittering for, at ejeren har set beskeden. Afsendelsesfejl logges uden brugeroplysninger eller nøgler. En afsendelsesfejl ruller ikke en gemt profil tilbage.

Automatiske tests omfatter nye profiler, profilrettelser, ugyldige/fejlede kald, samtidige oprettelser, forfalskede modtagere/ejermarkeringer, bekræftet partneradresse, ændrede/udløbne enheder, fjernet ejertilladelse, tre sprog og eksisterende push-forløb. Produktionens FCM-servicekonto blev kontrolleret med `validate_only=true` uden at sende nogen rigtig besked.

Valideret 23. oktober 2026: `npm test` bestod alle 228 tests inklusive build. Endeligt produktionsbuild og 11 målrettede push-tests bestod efter den sidste rettelse. Lint afsluttede med 0 fejl og 12 eksisterende billedadvarsler. Ved konfigurationskontrollen var Web Push-nøglen og `CIRCLE_PUSH_ENABLED` endnu ikke sat i Netlify; nøgleoprettelse og enhedernes tilladelser er nødvendige før reel levering.
