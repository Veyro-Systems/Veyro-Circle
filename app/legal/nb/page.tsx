import {termsContent} from "@/lib/terms-content";
import {LegalTextContent,CompanyContact} from "@/components/legal-text";
import {privacyContent,cookieContent} from "@/lib/privacy-policy";
import { COMPANY_IDENTITY } from "@/lib/company";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {title:"Juridisk informasjon — Veyro Circle",description:"Personvern, GDPR, abonnement, informasjonskapsler, klager og sikkerhet for Veyro Circle."};

export default function NorwegianLegalPage() {
  return <main className="legal-page" lang="nb">
    <header className="legal-header"><div><Link href="/?lang=nb" aria-label="Til Veyro Circle"><Image src="/branding/veyro-systems-logo.png" alt="Veyro Systems" width={150} height={64}/></Link><Link href="/?lang=nb">← Tilbake til Veyro Circle</Link></div></header>
    <article className="legal-content">
      <header><p className="eyebrow">Veyro Circle</p><h1>Juridisk informasjon</h1><p>Informasjon om behandling av personopplysninger, abonnement, informasjonskapsler, klagemuligheter og ansvar. Sist oppdatert 23. oktober 2026.</p></header>
      <section className="legal-section" id="company"><h2>Virksomhetsopplysninger</h2><p>Veyro Circle leveres av {COMPANY_IDENTITY}.</p><CompanyContact/></section>
      <LegalTextContent id="privacy" content={privacyContent.nb}/>
      <LegalTextContent id="terms" content={termsContent.nb}/>
      <LegalTextContent id="cookies" content={cookieContent.nb}/>
      <section className="legal-section" id="complaints"><h2>Klager</h2><p>Kontakt først {COMPANY_IDENTITY} på <a href="mailto:info@veyrosystems.com">info@veyrosystems.com</a> hvis du har en klage på Circle.</p><p>Hvis vi ikke finner en løsning, kan du se <a href="https://www.forbrukerradet.no/her-klager-du/">Forbrukerrådets oversikt over klagemuligheter</a>. Mekling eller nemndsbehandling avhenger av organets kompetanse, saksregler og eventuelle gebyrer. Ved grensekryssende handel kan <a href="https://forbrukereuropa.no/">Forbruker Europa</a> veilede. En privat tvist med en annen bruker er adskilt fra en klage på Circle.</p><p>Klager om personopplysninger kan sendes til <a href="https://www.datatilsynet.no/">Datatilsynet</a> eller en annen kompetent tilsynsmyndighet.</p></section>
      <section className="legal-section" id="safety"><h2>Sikkerhet, identitet og ansvar</h2><p>Partene bør kontrollere hverandres navn og adresse ved å se gyldig legitimasjon, gjennomgå avtalen sammen og signere på telefonen eller på papir. Unngå å kopiere eller fotografere legitimasjon med mindre det finnes et konkret og lovlig behov.</p><p>Beskriv tingens tilstand, pris, depositum, periode, levering og eventuelle skader i avtalen. Veyro Circle stiller plattformen og avtaleverktøyet til rådighet, men kan ikke garantere en brukers identitet, en tings tilstand eller at en privat avtale blir oppfylt.</p></section>
      <footer><p>{COMPANY_IDENTITY}</p></footer>
    </article>
  </main>;
}
