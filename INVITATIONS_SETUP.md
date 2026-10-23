# Invitér en nabo, profilbilleder og kortere forside

Tilpasset ZIP-pakken til det eksisterende Veyro Circle-projekt. ZIP-filens installationsprogram er gennemlæst, men ikke kørt. Implementeringen bevarer Firebase, Stripe, abonnementer, 180-dagesperioden, annoncer, aftaler og brugernes kontaktdata.

Under Konto findes et personligt invitationslink med Kopiér link og mobilens delingsmenu. Linket følger det valgte danske, svenske eller norske sprog. Der sendes ingen mails eller beskeder automatisk. Brugeren vælger selv modtagerne i delingsmenuen.

Kun en ny, verificeret bruger, der aktivt vælger invitationen, tæller med. Valget er frivilligt og ikke forhåndsmarkeret. Før dette valg gemmes ingen invitationskode i browserlageret. Det valgte link huskes i højst 30 dage på enheden, så mailbekræftelsen ikke bryder tilknytningen. Det fjernes efter vellykket profiloprettelse. Koden kan ikke give en ny gratisperiode eller ændre et abonnement.

Serveren udsteder tilfældige koder og afgør afsenderen via `inviteCodes`. Profil og `inviteSignups` oprettes atomisk. Selvinvitation, eksisterende konti, genindsendelser, samtidige kald og manglende samtykke giver ingen ekstra tilskrivning. Afsenderen ser kun samlede antal. Ejere får desuden en samlet oversigt efter den eksisterende verificerede ejertilladelse.

Første aktive annonce tæller en person én gang. Statistikken gemmes efter annoncegemningen; senere aktive annonceopdateringer kan genforsøge en fejlet markering. Et mislykket statistikopslag spærrer ikke en almindelig profiloprettelse, og fejl i annoncemarkeringen spærrer ikke annoncegemningen. Statistikken bruger afgrænsede felter via Firestore-forespørgsler; ved meget store datamængder bør forespørgslerne erstattes af aggregeringer. Der registreres ingen klik.

Profilbilleder tilføjes, udskiftes og fjernes under Konto. En verificeret serverfunktion vælger brugerens egen lagersti, kontrollerer og genkoder JPEG-filen til 512 × 512, fjerner metadata og ændrer kun `profilePhoto` på profilen. Gamle billeder ryddes fra samme brugers område; en mislykket profilgemning rydder den nye upload. Billedet er offentligt via en særskilt downloadadresse og vises i personprofilen. Private aftalebilleder bruger fortsat deres eksisterende private adgang.

Forsidens store prøveperiodeboks og knappen Find noget at låne er fjernet. Tilføj en ting bevares, også på mobil. Priser og vilkår findes fortsat ved konto, oprettelse og abonnement.

Firestore- og Storage-reglerne afviser direkte klientadgang til de nye interne områder. Profilbilleders offentlige downloadadresse oprettes kun af serveren. Privatlivs- og lagringstekst er opdateret på alle tre sprog.

Testene bruger lokale dobbelter og fiktive billedfiler. Ingen produktionstilmeldinger, personlige invitationsbeskeder eller profilbilleder oprettes som test.

Kanban viser tre kolonner fra 1200 px, to på mellemstore skærme og én på mobil. Listevisning og kortvisning bevares. Den højeste gennemsnitlige bedømmelse blandt offentliggjorte annoncer får mærket Populær (Populär på svensk). Lige topbedømmelser deler mærket. Kun anmeldelser af udlejeren for den konkrete ting tæller; ejerens bedømmelser som låner og anmeldelser af andre ting tæller ikke. Gamle fempunktbedømmelser omregnes til seks, og ældre anmeldelser uden rolleafgrænsning kontrolleres mod den afsluttede aftale. Der gives ingen markering uden anmeldelser, og ingen kunstige anmeldelser oprettes. API'en beregner resultatet og ignorerer eventuelle popularitetsfelter på annoncerne.
