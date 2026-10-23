import type {Lang} from "./region";

export type LegalTextSection={id:string;title:string;paragraphs?:string[];items?:string[];links?:{label:string;href:string}[]};
export type LegalText={title:string;intro:string;sections:LegalTextSection[]};

export const privacyContent:Record<Lang,LegalText>={
 da:{
  title:"Privatliv og GDPR",
  intro:"Denne politik forklarer, hvordan Veyro Circle behandler oplysninger om besøgende, kontohavere, lånere og udlejere. Personoplysninger er oplysninger, som kan knyttes til en person, også indirekte gennem et bruger-ID, et billede eller en IP-adresse.",
  sections:[
   {id:"controller",title:"Hvem har ansvaret?",paragraphs:["Veyro Systems ApS er dataansvarlig for Circles behandling af personoplysninger. Virksomheds- og kontaktoplysninger står ovenfor. Skriv til os, hvis du har spørgsmål eller ønsker at bruge dine rettigheder."]},
   {id:"data",title:"Hvilke oplysninger kommer ind i Circle?",items:[
    "Fra dig: navn, e-mail, telefon, adresse, postområde, land, sprog og indstillinger. Firebase Authentication håndterer adgangskode og login. Circle viser ikke adgangskoder til andre brugere.",
    "Fra din brug: annoncer, billeder, priser, depositum, favoritter, gemte søgninger, efterlysninger, beskeder og kalenderoplysninger.",
    "Fra en aftale: deltagere, aftalt periode og pris, kontaktoplysninger, noter, underskrifter samt billeder og registreringer ved udlevering og retur. Den anden part kan også give oplysninger om dig i beskeder og anmeldelser.",
    "Fra betalingsudbyderen: kunde- og abonnementsreferencer, betalingsstatus, valuta, fornyelse og opsigelse. Kortoplysninger afgives hos Stripe ved aktivt valg af et betalt abonnement; Circle gemmer ikke fulde kortnumre.",
    "Fra browser og drift: IP-adresse, browser-/enhedsoplysninger, tidspunkt, forespurgte ressourcer og tekniske fejl. Aktiverer du push, behandles også en teknisk enhedsregistrering og dit valgte sprog."
   ],paragraphs:["Vi beder ikke om CPR-/personnummer, legitimation i kopi eller helbredsoplysninger. Undlad sådanne oplysninger og uvedkommendes private oplysninger i billeder, offentlige tekster og beskeder."]},
   {id:"purposes",title:"Hvad bruger vi oplysningerne til?",items:[
    "Aftale med dig, GDPR artikel 6, stk. 1, litra b: konto, login, profil, annoncer, søgning, aftaler, beskeder og administration af det abonnement, du selv vælger.",
    "Legitime interesser, artikel 6, stk. 1, litra f: sikker drift, fejlfinding, forebyggelse af misbrug og dubletkonti, dokumentation ved tvister og en troværdig markedsplads med anmeldelser. Kontrolværdier af telefon- og profiloplysninger hjælper med at opdage flere konti for samme bruger.",
    "Retlige forpligtelser, artikel 6, stk. 1, litra c: blandt andet bogføring og lovlige myndighedskrav, når de gælder for os.",
    "Samtykke, artikel 6, stk. 1, litra a: valgfrie push-beskeder og eventuel senere, samtykkekrævende statistik eller markedsføring. Du kan trække samtykke tilbage uden at ændre lovligheden af den tidligere behandling."
   ],paragraphs:["Navn, kontaktoplysninger og postområde er nødvendige for en fuld konto og aftalefunktionerne. Uden dem kan de funktioner ikke leveres. Du kan stadig se offentlige annoncer uden konto. Push, billeder, anmeldelser og gemte søgninger er valgfrie. Vi sælger ikke dine personoplysninger."]},
   {id:"visibility",title:"Hvad kan andre se?",paragraphs:[
    "Offentlige annoncer, annoncebilleder, efterlysninger, fornavn, by/postområde, udlejerprofil og udlejeranmeldelser kan ses uden login. Profilen viser en samlet bedømmelse og de aktuelt offentlige ting. Offentligt indhold kan kopieres eller gemmes af andre.",
    "Privat adresse, telefon, e-mail og betalingsoplysninger vises ikke på den offentlige profil. Aftalens parter får nødvendige kontaktoplysninger efter ejerens godkendelse. Beskeder, underskrifter og aftalebilleder er ikke offentlige. En rettelse af din profil ændrer ikke nødvendigvis en allerede gemt aftales dokumentation.",
    "På en udlejerprofil og i en kortvisning af annoncer kan vi vise postområdets omtrentlige centrum med en områdemarkering. Det viser ikke udlejerens private adresse eller præcise position.",
    "Kalenderen viser optagede datoer uden deltagernes navne eller private noter. Virksomhedens ejere har desuden en intern kortoversigt over samlede antal konti pr. postområde. Den vises ikke til almindelige brugere og indeholder ikke navne eller gadeadresser. Postområdets omtrentlige centrum bruges; Circle indsamler ikke telefonens præcise GPS-position til kortet."
   ]},
   {id:"invitations",title:"Profilbillede og invitationer",paragraphs:[
    "Et profilbillede er valgfrit og vises offentligt på personprofilen. Du kan skifte eller fjerne det under Konto. Billedet beskæres og gemmes i et standardformat uden oprindelige EXIF-/GPS-oplysninger.",
    "Du kan dele et personligt invitationslink med dem, du selv vælger. En ny bruger vælger særskilt, om tilmeldingen må tælle i invitationsoversigten. Ved dette valg gemmer vi invitationskoden, afsenderens konto, samtykkeversion, tilmeldingsdato og tidspunktet for den første annonce. Afsenderen ser kun samlede antal, ikke navne eller kontaktoplysninger. Virksomhedens ejere kan se samlede invitationstal. Linkklik registreres ikke. Du kan fravælge inden profiloprettelsen eller kontakte os for at trække samtykket tilbage."
   ]},
   {id:"recipients",title:"Leverandører og andre modtagere",paragraphs:[
    "Google Firebase/Google Cloud bruges til login, database, billedlager og valgfrie push-beskeder. Netlify leverer webhosting og serverfunktioner. Leverandørerne modtager de oplysninger, som er nødvendige for deres funktion, og kan bruge underleverandører. Databehandling på vores vegne skal ske under databehandleraftaler og instrukser.",
    "Stripe håndterer betaling for Circle-abonnementer og kan også være selvstændig dataansvarlig, blandt andet for betalingslovgivning og svindelforebyggelse. Betaling og depositum mellem brugere aftales direkte og formidles ikke af Circle.",
    "Når et kort vises, hentes kortbilleder fra OpenStreetMap Foundations korttjeneste. Den modtager blandt andet den besøgendes IP-adresse og forespørgsler efter kortfelter, ikke Circles brugerregister.",
    "Ved en konkret supportsag kan relevante oplysninger behandles af vores e-mailleverandør og autoriserede medarbejdere eller rådgivere. Myndigheder eller andre modtagere får kun oplysninger, når der er et lovligt grundlag. Vi deler ikke private oplysninger til andre virksomheders egen markedsføring."
   ],links:[{label:"Firebase: privatliv og sikkerhed",href:"https://firebase.google.com/support/privacy"},{label:"Netlify: privatliv",href:"https://www.netlify.com/privacy/"},{label:"Stripe: privatliv",href:"https://stripe.com/privacy"},{label:"OpenStreetMap Foundation: privatliv",href:"https://osmfoundation.org/wiki/Privacy_Policy"}]},
   {id:"transfers",title:"Behandling uden for EU/EØS",paragraphs:[
    "Circles Firestore-database og billedlager i Firebase Storage er placeret i den europæiske region europe-west1 i Belgien. Login håndteres særskilt af Firebase Authentication, som behandler loginoplysninger i USA. Andre leverandørfunktioner kan også indebære behandling uden for EU/EØS; database- og lagerplaceringen omfatter ikke al behandling hos vores leverandører.",
    "Overførsel kræver et gyldigt grundlag, eksempelvis en gældende tilstrækkelighedsafgørelse, herunder EU–US Data Privacy Framework for en dækket, certificeret modtager, eller EU-Kommissionens standardkontraktbestemmelser med nødvendige supplerende foranstaltninger. Kontakt os for oplysninger om den konkrete modtager og grundlaget eller en kopi af relevante garantier."
   ]},
   {id:"retention",title:"Hvor længe gemmes oplysningerne?",items:[
    "Konto, annoncer, indstillinger og anmeldelser behandles, mens de er nødvendige for kontoen, offentliggørelsen og tjenesten. Ved anmodning om lukning vurderer vi, hvilke oplysninger der kan slettes eller anonymiseres, og hvilke der fortsat er nødvendige.",
    "Aftaler har som udgangspunkt en visningsperiode på 12 måneder fra oprettelsen. Efterlysninger vises i højst 30 dage. Disse visningsfrister er ikke et løfte om, at alle underliggende oplysninger fysisk slettes samme dag. Dokumentation kan være nødvendig for en uafsluttet aftale, en konkret tvist eller et lovkrav.",
    "En push-registrering bruges ikke til udsendelse efter 30 dage uden fornyelse. Du kan deaktivere den tidligere. Leverandørens tekniske sletning og sikkerhedskopier følger også leverandørens sletteforløb.",
    "Regnskabsmateriale om vores abonnementssalg opbevares som udgangspunkt i 5 år fra udgangen af det relevante regnskabsår. Det betyder ikke, at alle private låneaftaler skal gemmes efter bogføringsreglerne.",
    "Tekniske logs, supportsager og sikkerhedskopier opbevares efter formålet, fejl-/sikkerhedsbehov og eventuelle krav eller tvister. Vi skal fjerne eller anonymisere oplysninger, når der ikke længere er et lovligt behov; en udløbet gratisperiode giver ikke i sig selv ret til ubegrænset opbevaring."
   ]},
   {id:"security",title:"Beskyttelse og automatiske funktioner",paragraphs:[
    "Circle bruger krypterede forbindelser, login, serverkontrol af rettigheder og særskilt beskyttelse af private aftalebilleder. Adgang til driftsoplysninger skal begrænses til personer med et arbejdsbetinget behov. Ingen internetløsning kan garantere fuldstændig sikkerhed.",
    "Regler beregner blandt andet gratisperiodens udløb, annoncegrænser, ledige datoer og match til gemte søgninger. Vi anvender ikke AI-analyse af dine beskeder eller automatisk kreditvurdering i Circle. Kontakt os for manuel gennemgang, hvis en automatisk adgangs- eller dubletkontrol ser forkert ud."
   ]},
   {id:"rights",title:"Dine valg og rettigheder",items:[
    "Få indsigt og en kopi samt information om formål, kilder, modtagere og opbevaring.",
    "Få urigtige oplysninger rettet og efter betingelserne få oplysninger slettet eller behandlingen begrænset.",
    "Gøre indsigelse mod behandling baseret på legitime interesser. Ved direkte markedsføring kan du altid gøre indsigelse.",
    "Få dataportabilitet for relevante oplysninger, når betingelserne om samtykke/aftale og automatiseret behandling er opfyldt.",
    "Trække et samtykke tilbage og slå push fra via Circle eller enhedens indstillinger."
   ],paragraphs:[
    "Skriv til vores kontaktmail. Vi svarer uden unødig forsinkelse og som udgangspunkt inden en måned. Ved lovlig forlængelse får du besked og begrundelse inden den første måned; fristen kan forlænges med op til to måneder. Vi kan bede om nødvendige oplysninger for at bekræfte din identitet. Sletning kan være begrænset af andres rettigheder, dokumentationsbehov og lovkrav; vi forklarer et eventuelt afslag.",
    "Du kan klage til en relevant tilsynsmyndighed, blandt andet i landet hvor du bor eller arbejder. Du behøver ikke først at få vores tilladelse."
   ],links:[{label:"Danmark: Datatilsynet",href:"https://www.datatilsynet.dk/"},{label:"Sverige: Integritetsskyddsmyndigheten",href:"https://www.imy.se/"},{label:"Norge: Datatilsynet",href:"https://www.datatilsynet.no/"}]},
   {id:"updates",title:"Når politikken ændres",paragraphs:["Datoen øverst viser seneste opdatering. Ved væsentlige ændringer giver vi tydelig information i tjenesten eller via e-mail. Nye formål eller samtykkekrævende funktioner må ikke blot indføres med tilbagevirkende kraft. Denne politik er information om databehandling, ikke et samlet samtykke til alle tænkelige formål."]}
  ]
 },
 sv:{
  title:"Integritet och GDPR",
  intro:"Här förklarar vi hur Veyro Circle behandlar uppgifter om besökare, kontohavare, låntagare och uthyrare. Personuppgifter kan identifiera en person direkt eller indirekt, exempelvis genom ett användar-ID, en bild eller en IP-adress.",
  sections:[
   {id:"controller",title:"Vem ansvarar?",paragraphs:["Veyro Systems ApS är personuppgiftsansvarig för Circles behandling. Företags- och kontaktuppgifter finns ovan. Kontakta oss om du har frågor eller vill använda dina rättigheter."]},
   {id:"data",title:"Vilka uppgifter kommer in i Circle?",items:[
    "Från dig: namn, e-post, telefon, adress, postområde, land, språk och inställningar. Firebase Authentication hanterar lösenord och inloggning. Circle visar inte lösenord för andra användare.",
    "Från användningen: annonser, bilder, priser, deposition, favoriter, sparade sökningar, efterlysningar, meddelanden och kalenderuppgifter.",
    "Från ett avtal: parter, period, pris, kontaktuppgifter, anteckningar, underskrifter samt bilder och registreringar vid utlämning och återlämning. Motparten kan också lämna uppgifter om dig i meddelanden och omdömen.",
    "Från betaltjänsten: kund- och abonnemangsreferenser, betalningsstatus, valuta, förnyelse och uppsägning. Kortuppgifter lämnas hos Stripe när du aktivt väljer ett betalt abonnemang. Circle lagrar inte fullständiga kortnummer.",
    "Från webbläsaren och driften: IP-adress, webbläsar-/enhetsuppgifter, tidpunkt, begärda resurser och tekniska fel. Om du aktiverar push behandlas även en teknisk enhetsregistrering och valt språk."
   ],paragraphs:["Vi ber inte om personnummer, kopior av legitimation eller hälsouppgifter. Undvik sådana uppgifter och andras privata uppgifter i bilder, offentliga texter och meddelanden."]},
   {id:"purposes",title:"Vad använder vi uppgifterna till?",items:[
    "Avtal med dig, GDPR artikel 6.1 b: konto, inloggning, profil, annonser, sökning, avtal, meddelanden och administration av det abonnemang du själv väljer.",
    "Berättigade intressen, artikel 6.1 f: säker drift, felsökning, förebyggande av missbruk och dubbla konton, dokumentation vid tvister och en trovärdig marknadsplats med omdömen. Kontrollvärden av telefon- och profiluppgifter hjälper oss att upptäcka flera konton för samma användare.",
    "Rättsliga förpliktelser, artikel 6.1 c: bland annat bokföring och lagliga myndighetskrav som gäller oss.",
    "Samtycke, artikel 6.1 a: valfria pushnotiser och eventuell framtida statistik eller marknadsföring som kräver samtycke. Du kan återkalla samtycket utan att påverka lagligheten av tidigare behandling."
   ],paragraphs:["Namn, kontaktuppgifter och postområde behövs för ett fullständigt konto och avtalsfunktionerna. Utan dem kan dessa funktioner inte tillhandahållas. Offentliga annonser kan läsas utan konto. Push, bilder, omdömen och sparade sökningar är valfria. Vi säljer inte dina personuppgifter."]},
   {id:"visibility",title:"Vad kan andra se?",paragraphs:[
    "Offentliga annonser, annonsbilder, efterlysningar, förnamn, ort/postområde, uthyrarprofil och omdömen om uthyrare kan ses utan inloggning. Profilen visar ett samlat betyg och aktuella offentliga saker. Andra kan kopiera eller spara offentligt innehåll.",
    "Privat adress, telefon, e-post och betalningsuppgifter visas inte på den offentliga profilen. Avtalsparterna får nödvändiga kontaktuppgifter efter ägarens godkännande. Meddelanden, underskrifter och avtalsbilder är inte offentliga. En profiländring ändrar inte nödvändigtvis dokumentationen i ett redan sparat avtal.",
    "På en uthyrarprofil och i en kartvy över annonser kan vi visa postområdets ungefärliga centrum med en områdesmarkering. Uthyrarens privata adress eller exakta position visas inte.",
    "Kalendern visar upptagna datum utan deltagarnas namn eller privata anteckningar. Företagets ägare har en intern karta över sammanlagt antal konton per postområde. Den visas inte för vanliga användare och innehåller inte namn eller gatuadresser. Postområdets ungefärliga centrum används; Circle samlar inte in telefonens exakta GPS-position för kartan."
   ]},
   {id:"invitations",title:"Profilbild och inbjudningar",paragraphs:[
    "En profilbild är frivillig och visas offentligt på personprofilen. Du kan byta eller ta bort den under Konto. Bilden beskärs och sparas i ett standardformat utan ursprungliga EXIF-/GPS-uppgifter.",
    "Du kan dela en personlig inbjudningslänk med dem du själv väljer. En ny användare väljer separat om registreringen får räknas i inbjudningsöversikten. Vid detta val sparar vi inbjudningskoden, avsändarens konto, samtyckesversion, registreringsdatum och tidpunkten för den första annonsen. Avsändaren ser bara sammanlagda antal, inte namn eller kontaktuppgifter. Företagets ägare kan se sammanlagda inbjudningsantal. Länkklick registreras inte. Du kan avstå före profilregistreringen eller kontakta oss för att återkalla samtycket."
   ]},
   {id:"recipients",title:"Leverantörer och andra mottagare",paragraphs:[
    "Google Firebase/Google Cloud används för inloggning, databas, bildlagring och valfria pushnotiser. Netlify tillhandahåller webbhosting och serverfunktioner. Leverantörerna får de uppgifter som behövs för deras funktion och kan anlita underleverantörer. Behandling för vår räkning ska omfattas av personuppgiftsbiträdesavtal och instruktioner.",
    "Stripe hanterar betalning för Circle-abonnemang och kan även vara självständigt personuppgiftsansvarig, bland annat för betalningsregler och bedrägeribekämpning. Betalning och deposition mellan användare avtalas direkt och förmedlas inte av Circle.",
    "När en karta visas hämtas kartbilder från OpenStreetMap Foundations karttjänst. Den får bland annat besökarens IP-adress och begäran om kartfält, inte Circles användarregister.",
    "I ett konkret supportärende kan relevanta uppgifter behandlas av vår e-postleverantör och behörig personal eller rådgivare. Myndigheter och andra mottagare får uppgifter endast med laglig grund. Vi delar inte privata uppgifter för andra företags egen marknadsföring."
   ],links:[{label:"Firebase: integritet och säkerhet",href:"https://firebase.google.com/support/privacy"},{label:"Netlify: integritet",href:"https://www.netlify.com/privacy/"},{label:"Stripe: integritet",href:"https://stripe.com/privacy"},{label:"OpenStreetMap Foundation: integritet",href:"https://osmfoundation.org/wiki/Privacy_Policy"}]},
   {id:"transfers",title:"Behandling utanför EU/EES",paragraphs:[
    "Circles Firestore-databas och bildlagring i Firebase Storage är placerade i den europeiska regionen europe-west1 i Belgien. Inloggning hanteras separat av Firebase Authentication, som behandlar inloggningsuppgifter i USA. Andra leverantörsfunktioner kan också innebära behandling utanför EU/EES. Databasens och lagringens placering omfattar inte all behandling hos våra leverantörer.",
    "Överföring kräver en giltig grund, exempelvis ett gällande beslut om adekvat skyddsnivå, däribland EU–US Data Privacy Framework för en omfattad certifierad mottagare, eller EU-kommissionens standardavtalsklausuler med nödvändiga kompletterande åtgärder. Kontakta oss för information om mottagaren och grunden eller en kopia av relevanta skyddsåtgärder."
   ]},
   {id:"retention",title:"Hur länge sparas uppgifterna?",items:[
    "Konto, annonser, inställningar och omdömen behandlas medan de behövs för kontot, publiceringen och tjänsten. När du begär avslut bedömer vi vad som kan raderas eller anonymiseras och vad som fortfarande behövs.",
    "Avtal har normalt en visningsperiod på 12 månader från skapandet. Efterlysningar visas i högst 30 dagar. Visningsfristerna innebär inte att alla underliggande uppgifter fysiskt raderas samma dag. Dokumentation kan behövas för ett pågående avtal, en konkret tvist eller ett lagkrav.",
    "En pushregistrering används inte för utskick efter 30 dagar utan förnyelse. Du kan inaktivera den tidigare. Leverantörens tekniska radering och säkerhetskopior följer även leverantörens raderingsförlopp.",
    "Bokföringsmaterial om vår abonnemangsförsäljning sparas normalt i 5 år från slutet av relevant räkenskapsår. Detta betyder inte att alla privata låneavtal ska sparas enligt bokföringsreglerna.",
    "Tekniska loggar, supportärenden och säkerhetskopior sparas utifrån ändamål, fel-/säkerhetsbehov samt eventuella krav eller tvister. Uppgifter ska raderas eller anonymiseras när lagligt behov saknas. En utgången gratisperiod medger inte i sig obegränsad lagring."
   ]},
   {id:"security",title:"Skydd och automatiska funktioner",paragraphs:[
    "Circle använder krypterade förbindelser, inloggning, serverkontroll av behörighet och särskilt skydd för privata avtalsbilder. Tillgång till driftuppgifter ska begränsas till personer med ett arbetsrelaterat behov. Ingen internettjänst kan garantera fullständig säkerhet.",
    "Regler beräknar bland annat gratisperiodens slut, annonsgränser, lediga datum och matchningar för sparade sökningar. Circle använder inte AI-analys av dina meddelanden eller automatisk kreditprövning. Kontakta oss för manuell granskning om en automatisk åtkomst- eller dubblettkontroll verkar felaktig."
   ]},
   {id:"rights",title:"Dina val och rättigheter",items:[
    "Få tillgång till och en kopia av uppgifter samt information om ändamål, källor, mottagare och lagring.",
    "Få felaktigheter rättade och, när villkoren är uppfyllda, uppgifter raderade eller behandlingen begränsad.",
    "Invända mot behandling som grundas på berättigade intressen. Du kan alltid invända mot direktmarknadsföring.",
    "Få dataportabilitet när villkoren om samtycke/avtal och automatiserad behandling är uppfyllda.",
    "Återkalla samtycke och stänga av push via Circle eller enhetens inställningar."
   ],paragraphs:[
    "Skriv till vår kontaktadress. Vi svarar utan onödigt dröjsmål och normalt inom en månad. Vid en tillåten förlängning informerar vi inom första månaden om skälen; fristen får förlängas med upp till två månader. Vi kan be om nödvändiga uppgifter för att bekräfta din identitet. Radering kan begränsas av andras rättigheter, dokumentationsbehov och lagkrav. Ett avslag motiveras.",
    "Du får klaga till en relevant tillsynsmyndighet, bland annat i landet där du bor eller arbetar. Vårt tillstånd behövs inte."
   ],links:[{label:"Danmark: Datatilsynet",href:"https://www.datatilsynet.dk/"},{label:"Sverige: Integritetsskyddsmyndigheten",href:"https://www.imy.se/"},{label:"Norge: Datatilsynet",href:"https://www.datatilsynet.no/"}]},
   {id:"updates",title:"När policyn ändras",paragraphs:["Datumet överst visar senaste uppdatering. Väsentliga ändringar meddelas tydligt i tjänsten eller via e-post. Nya ändamål eller funktioner som kräver samtycke får inte införas retroaktivt genom en textändring. Policyn informerar om behandling och är inte ett generellt samtycke till alla tänkbara ändamål."]}
  ]
 },
 nb:{
  title:"Personvern og GDPR",
  intro:"Denne erklæringen forklarer hvordan Veyro Circle behandler opplysninger om besøkende, kontohavere, lånere og utleiere. Personopplysninger kan knyttes til en person direkte eller indirekte, for eksempel via en bruker-ID, et bilde eller en IP-adresse.",
  sections:[
   {id:"controller",title:"Hvem har ansvaret?",paragraphs:["Veyro Systems ApS er behandlingsansvarlig for Circles behandling. Virksomhets- og kontaktopplysninger står ovenfor. Kontakt oss med spørsmål eller for å bruke rettighetene dine."]},
   {id:"data",title:"Hvilke opplysninger kommer inn i Circle?",items:[
    "Fra deg: navn, e-post, telefon, adresse, postområde, land, språk og innstillinger. Firebase Authentication håndterer passord og innlogging. Circle viser ikke passord til andre brukere.",
    "Fra bruken din: annonser, bilder, priser, depositum, favoritter, lagrede søk, etterlysninger, meldinger og kalenderopplysninger.",
    "Fra en avtale: deltakere, periode, pris, kontaktopplysninger, notater, underskrifter samt bilder og registreringer ved utlevering og retur. Motparten kan også gi opplysninger om deg i meldinger og vurderinger.",
    "Fra betalingstjenesten: kunde- og abonnementsreferanser, betalingsstatus, valuta, fornyelse og oppsigelse. Kortopplysninger gis hos Stripe når du aktivt velger et betalt abonnement. Circle lagrer ikke fullstendige kortnumre.",
    "Fra nettleseren og driften: IP-adresse, nettleser-/enhetsopplysninger, tidspunkt, forespurte ressurser og tekniske feil. Aktiverer du push, behandles også en teknisk enhetsregistrering og valgt språk."
   ],paragraphs:["Vi ber ikke om fødselsnummer, kopier av legitimasjon eller helseopplysninger. Unngå slike opplysninger og andres private opplysninger i bilder, offentlige tekster og meldinger."]},
   {id:"purposes",title:"Hva bruker vi opplysningene til?",items:[
    "Avtale med deg, GDPR artikkel 6 nr. 1 bokstav b: konto, innlogging, profil, annonser, søk, avtaler, meldinger og administrasjon av abonnementet du selv velger.",
    "Berettigede interesser, artikkel 6 nr. 1 bokstav f: sikker drift, feilsøking, forebygging av misbruk og dobbeltkontoer, dokumentasjon ved tvister og en troverdig markedsplass med vurderinger. Kontrollverdier av telefon- og profilopplysninger hjelper oss å oppdage flere kontoer for samme bruker.",
    "Rettslige forpliktelser, artikkel 6 nr. 1 bokstav c: blant annet bokføring og lovlige myndighetskrav som gjelder oss.",
    "Samtykke, artikkel 6 nr. 1 bokstav a: valgfrie pushvarsler og eventuell senere statistikk eller markedsføring som krever samtykke. Samtykket kan trekkes tilbake uten at det endrer lovligheten av tidligere behandling."
   ],paragraphs:["Navn, kontaktopplysninger og postområde er nødvendige for en fullstendig konto og avtalefunksjonene. Uten dem kan disse funksjonene ikke leveres. Offentlige annonser kan fortsatt leses uten konto. Push, bilder, vurderinger og lagrede søk er valgfrie. Vi selger ikke personopplysningene dine."]},
   {id:"visibility",title:"Hva kan andre se?",paragraphs:[
    "Offentlige annonser, annonsebilder, etterlysninger, fornavn, sted/postområde, utleierprofil og utleiervurderinger kan ses uten innlogging. Profilen viser en samlet vurdering og de aktuelle offentlige tingene. Andre kan kopiere eller lagre offentlig innhold.",
    "Privat adresse, telefon, e-post og betalingsopplysninger vises ikke på den offentlige profilen. Avtalepartene får nødvendige kontaktopplysninger etter eierens godkjenning. Meldinger, underskrifter og avtalebilder er ikke offentlige. En profilendring endrer ikke nødvendigvis dokumentasjonen i en allerede lagret avtale.",
    "På en utleierprofil og i en kartvisning av annonser kan vi vise postområdets omtrentlige sentrum med en områdemarkering. Utleierens private adresse eller nøyaktige posisjon vises ikke.",
    "Kalenderen viser opptatte datoer uten deltakernes navn eller private notater. Virksomhetens eiere har en intern kartoversikt over samlet antall kontoer per postområde. Den vises ikke til vanlige brukere og inneholder ikke navn eller gateadresser. Postområdets omtrentlige sentrum brukes. Circle samler ikke inn telefonens nøyaktige GPS-posisjon til kartet."
   ]},
   {id:"invitations",title:"Profilbilde og invitasjoner",paragraphs:[
    "Et profilbilde er valgfritt og vises offentlig på personprofilen. Du kan bytte eller fjerne det under Konto. Bildet beskjæres og lagres i et standardformat uten opprinnelige EXIF-/GPS-opplysninger.",
    "Du kan dele en personlig invitasjonslenke med dem du selv velger. En ny bruker velger særskilt om registreringen kan telles i invitasjonsoversikten. Ved dette valget lagrer vi invitasjonskoden, avsenderens konto, samtykkeversjon, registreringsdato og tidspunktet for den første annonsen. Avsenderen ser bare samlede antall, ikke navn eller kontaktopplysninger. Virksomhetens eiere kan se samlede invitasjonstall. Klikk på lenker registreres ikke. Du kan velge bort før profilregistreringen eller kontakte oss for å trekke samtykket tilbake."
   ]},
   {id:"recipients",title:"Leverandører og andre mottakere",paragraphs:[
    "Google Firebase/Google Cloud brukes til innlogging, database, bildelagring og valgfrie pushvarsler. Netlify leverer webhosting og serverfunksjoner. Leverandørene får opplysninger som er nødvendige for funksjonen sin og kan bruke underleverandører. Behandling på våre vegne skal være underlagt databehandleravtaler og instrukser.",
    "Stripe håndterer betaling for Circle-abonnementer og kan også være selvstendig behandlingsansvarlig, blant annet for betalingsregler og forebygging av svindel. Betaling og depositum mellom brukere avtales direkte og formidles ikke av Circle.",
    "Når et kart vises, hentes kartbilder fra OpenStreetMap Foundations karttjeneste. Den mottar blant annet den besøkendes IP-adresse og forespørsler etter kartfelt, ikke Circles brukerregister.",
    "I en konkret supportsak kan relevante opplysninger behandles av e-postleverandøren vår og autoriserte medarbeidere eller rådgivere. Myndigheter og andre mottakere får bare opplysninger med lovlig grunnlag. Vi deler ikke private opplysninger til andre virksomheters egen markedsføring."
   ],links:[{label:"Firebase: personvern og sikkerhet",href:"https://firebase.google.com/support/privacy"},{label:"Netlify: personvern",href:"https://www.netlify.com/privacy/"},{label:"Stripe: personvern",href:"https://stripe.com/privacy"},{label:"OpenStreetMap Foundation: personvern",href:"https://osmfoundation.org/wiki/Privacy_Policy"}]},
   {id:"transfers",title:"Behandling utenfor EU/EØS",paragraphs:[
    "Circles Firestore-database og bildelager i Firebase Storage ligger i den europeiske regionen europe-west1 i Belgia. Innlogging håndteres separat av Firebase Authentication, som behandler innloggingsopplysninger i USA. Andre leverandørfunksjoner kan også innebære behandling utenfor EU/EØS. Database- og lagerplasseringen omfatter ikke all behandling hos leverandørene våre.",
    "Overføring krever gyldig grunnlag, eksempelvis en gjeldende beslutning om tilstrekkelig beskyttelsesnivå, herunder EU–US Data Privacy Framework for en omfattet sertifisert mottaker, eller EU-kommisjonens standard personvernbestemmelser med nødvendige supplerende tiltak. Kontakt oss for opplysninger om mottaker og grunnlag eller en kopi av relevante garantier."
   ]},
   {id:"retention",title:"Hvor lenge lagres opplysningene?",items:[
    "Konto, annonser, innstillinger og vurderinger behandles mens de trengs for kontoen, publiseringen og tjenesten. Ved forespørsel om avslutning vurderer vi hva som kan slettes eller anonymiseres og hva som fortsatt er nødvendig.",
    "Avtaler har normalt en visningsperiode på 12 måneder fra opprettelsen. Etterlysninger vises i høyst 30 dager. Visningsfristene betyr ikke at alle underliggende opplysninger fysisk slettes samme dag. Dokumentasjon kan være nødvendig for en uavsluttet avtale, en konkret tvist eller et lovkrav.",
    "En pushregistrering brukes ikke til utsendelse etter 30 dager uten fornyelse. Du kan deaktivere den tidligere. Leverandørens tekniske sletting og sikkerhetskopier følger også leverandørens sletteforløp.",
    "Regnskapsmateriale om vårt abonnementssalg oppbevares normalt i 5 år fra utgangen av det relevante regnskapsåret. Dette betyr ikke at alle private låneavtaler skal lagres etter bokføringsreglene.",
    "Tekniske logger, supportsaker og sikkerhetskopier oppbevares etter formål, feil-/sikkerhetsbehov og eventuelle krav eller tvister. Opplysninger skal slettes eller anonymiseres når lovlig behov ikke lenger finnes. En utløpt gratisperiode gir ikke i seg selv grunnlag for ubegrenset oppbevaring."
   ]},
   {id:"security",title:"Beskyttelse og automatiske funksjoner",paragraphs:[
    "Circle bruker krypterte forbindelser, innlogging, serverkontroll av rettigheter og særskilt beskyttelse av private avtalebilder. Tilgang til driftsopplysninger skal begrenses til personer med et arbeidsbetinget behov. Ingen internettjeneste kan garantere fullstendig sikkerhet.",
    "Regler beregner blant annet gratisperiodens slutt, annonsegrenser, ledige datoer og treff for lagrede søk. Circle bruker ikke AI-analyse av meldingene dine eller automatisk kredittvurdering. Kontakt oss for manuell gjennomgang dersom en automatisk tilgangs- eller duplikatkontroll virker feil."
   ]},
   {id:"rights",title:"Dine valg og rettigheter",items:[
    "Få innsyn og en kopi samt opplysninger om formål, kilder, mottakere og lagring.",
    "Få feil rettet og, når vilkårene er oppfylt, opplysninger slettet eller behandlingen begrenset.",
    "Protestere mot behandling basert på berettigede interesser. Du kan alltid protestere mot direkte markedsføring.",
    "Få dataportabilitet når vilkårene om samtykke/avtale og automatisert behandling er oppfylt.",
    "Trekke tilbake samtykke og slå av push via Circle eller enhetens innstillinger."
   ],paragraphs:[
    "Skriv til kontaktadressen vår. Vi svarer uten ugrunnet opphold og normalt innen en måned. Ved lovlig forlengelse varsler vi innen den første måneden og forklarer årsaken. Fristen kan forlenges med opptil to måneder. Vi kan be om nødvendige opplysninger for å bekrefte identiteten din. Sletting kan begrenses av andres rettigheter, dokumentasjonsbehov og lovkrav. Et eventuelt avslag begrunnes.",
    "Du kan klage til en relevant tilsynsmyndighet, blant annet i landet der du bor eller arbeider. Du trenger ikke vår tillatelse først."
   ],links:[{label:"Danmark: Datatilsynet",href:"https://www.datatilsynet.dk/"},{label:"Sverige: Integritetsskyddsmyndigheten",href:"https://www.imy.se/"},{label:"Norge: Datatilsynet",href:"https://www.datatilsynet.no/"}]},
   {id:"updates",title:"Når erklæringen endres",paragraphs:["Datoen øverst viser siste oppdatering. Vesentlige endringer varsles tydelig i tjenesten eller via e-post. Nye formål eller funksjoner som krever samtykke kan ikke innføres med tilbakevirkende kraft gjennom en tekstendring. Erklæringen gir informasjon om behandling og er ikke et samlet samtykke til alle tenkelige formål."]}
  ]
 }
};

export const cookieContent:Record<Lang,LegalText>={
 da:{title:"Cookies og lokal lagring",intro:"Cookies og tilsvarende lagring kan huske oplysninger i din browser. Circle bruger nødvendig lagring til login og de funktioner, du vælger. Besøg er ikke automatisk anonyme: hosting og login kan behandle IP-adresse og tekniske oplysninger.",sections:[
  {id:"storage",title:"Hvad husker browseren?",items:["Firebase Authentication bruger blandt andet browserlagring til at holde dig logget ind. Sessionen kan afsluttes ved at logge ud eller rydde webstedets data.","Sprogvalg og markering af en vist betalingspåmindelse gemmes lokalt. Der er ingen indbygget tidsfrist i disse lokale markeringer; de bliver, indtil de ændres eller browserdata ryddes.","Når du vælger at bruge en invitation ved oprettelse, gemmes koden lokalt i højst 30 dage, så den kan følge med gennem mailbekræftelsen. Den fjernes efter en vellykket profiloprettelse eller dit fravalg og bruges ikke efter udløb.","Ved push gemmes en lokal markering og tekniske registreringer til levering af de beskeder, du har valgt. Deaktivering fjerner den lokale markering. En service worker gemmer statiske logoer og en offline-side, ikke private aftaler eller chattekster."]},
  {id:"choices",title:"Valg og tredjeparter",paragraphs:["Circles egen app har ikke Google Analytics eller annoncepixels installeret. Ikke-nødvendig statistik eller markedsføringssporing må først aktiveres efter relevant information og gyldigt samtykke. Kort- og betalingsleverandører behandler tekniske oplysninger, når deres funktion åbnes; se privatlivspolitikkens leverandørlinks.","Du kan rydde webstedets cookies og lokale data i browseren. Det kan logge dig ud og fjerne lokale indstillinger. Push kan slås fra i Circle og enhedens indstillinger. Spørgsmål kan sendes til vores kontaktmail."]}
 ]},
 sv:{title:"Cookies och lokal lagring",intro:"Cookies och liknande lagring kan komma ihåg information i din webbläsare. Circle använder nödvändig lagring för inloggning och funktioner du väljer. Besök är inte automatiskt anonyma: hosting och inloggning kan behandla IP-adress och tekniska uppgifter.",sections:[
  {id:"storage",title:"Vad kommer webbläsaren ihåg?",items:["Firebase Authentication använder bland annat webbläsarlagring för att hålla dig inloggad. Logga ut eller rensa webbplatsens data för att avsluta sessionen.","Språkval och en markering om visad betalningspåminnelse sparas lokalt. Markeringarna har ingen inbyggd tidsgräns utan finns kvar tills de ändras eller webbläsardata rensas.","När du väljer att använda en inbjudan vid registrering sparas koden lokalt i högst 30 dagar, så att den kan följa med genom e-postbekräftelsen. Den tas bort efter en lyckad profilregistrering eller om du avstår och används inte efter att tiden gått ut.","För push sparas en lokal markering och tekniska registreringar för leverans av valda notiser. Inaktivering tar bort den lokala markeringen. En service worker sparar statiska logotyper och en offlinesida, inte privata avtal eller chatttexter."]},
  {id:"choices",title:"Val och tredjeparter",paragraphs:["Circles egen app har inte Google Analytics eller annonspixlar installerade. Statistik eller marknadsföringsspårning som inte är nödvändig får aktiveras först efter relevant information och giltigt samtycke. Kart- och betalleverantörer behandlar tekniska uppgifter när deras funktion öppnas; se leverantörslänkarna i integritetspolicyn.","Du kan rensa webbplatsens cookies och lokala data i webbläsaren. Det kan logga ut dig och ta bort lokala inställningar. Push kan stängas av i Circle och enhetens inställningar. Frågor kan skickas till vår kontaktadress."]}
 ]},
 nb:{title:"Informasjonskapsler og lokal lagring",intro:"Informasjonskapsler og lignende lagring kan huske informasjon i nettleseren din. Circle bruker nødvendig lagring til innlogging og funksjoner du velger. Besøk er ikke automatisk anonyme: hosting og innlogging kan behandle IP-adresse og tekniske opplysninger.",sections:[
  {id:"storage",title:"Hva husker nettleseren?",items:["Firebase Authentication bruker blant annet nettleserlagring for å holde deg innlogget. Logg ut eller slett nettstedets data for å avslutte økten.","Språkvalg og en markering av vist betalingspåminnelse lagres lokalt. Markeringene har ingen innebygd tidsfrist og blir liggende til de endres eller nettleserdata slettes.","Når du velger å bruke en invitasjon ved registrering, lagres koden lokalt i høyst 30 dager, slik at den kan følge med gjennom e-postbekreftelsen. Den fjernes etter en vellykket profilregistrering eller hvis du velger bort, og brukes ikke etter utløp.","Ved push lagres en lokal markering og tekniske registreringer for levering av valgte varsler. Deaktivering fjerner den lokale markeringen. En service worker lagrer statiske logoer og en frakoblet side, ikke private avtaler eller chattekster."]},
  {id:"choices",title:"Valg og tredjeparter",paragraphs:["Circles egen app har ikke Google Analytics eller annonsepiksler installert. Ikke-nødvendig statistikk eller markedsføringssporing kan først aktiveres etter relevant informasjon og gyldig samtykke. Kart- og betalingsleverandører behandler tekniske opplysninger når funksjonen deres åpnes; se leverandørlenkene i personvernerklæringen.","Du kan slette nettstedets informasjonskapsler og lokale data i nettleseren. Det kan logge deg ut og fjerne lokale innstillinger. Push kan slås av i Circle og enhetens innstillinger. Spørsmål kan sendes til kontaktadressen vår."]}
 ]}
};
