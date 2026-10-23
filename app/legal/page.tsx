import {termsContent} from "@/lib/terms-content";
import {LegalTextContent,CompanyContact} from "@/components/legal-text";
import {privacyContent,cookieContent} from "@/lib/privacy-policy";
import { COMPANY_IDENTITY } from "@/lib/company";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Juridisk information — Veyro Circle", description: "Privatliv, GDPR, handelsbetingelser, cookies, klager og sikkerhed for Veyro Circle." };

export default function LegalPage() {
  return <main className="legal-page">
    <header className="legal-header"><div><Link href="/" aria-label="Til Veyro Circle"><img src="/branding/veyro-systems-logo.png" alt="Veyro Systems" /></Link><Link href="/">← Tilbage til Veyro Circle</Link></div></header>
    <article className="legal-content">
      <header><p className="eyebrow">Veyro Circle</p><h1>Juridisk information</h1><p>Her finder du information om behandling af personoplysninger, abonnement, cookies, klagemuligheder og ansvar. Senest opdateret 23. oktober 2026.</p></header>
      <section className="legal-section" id="company"><h2>Virksomhedsoplysninger</h2><p>Veyro Circle udbydes af {COMPANY_IDENTITY}.</p><CompanyContact/></section>
      <LegalTextContent id="privacy" content={privacyContent.da}/>
      <LegalTextContent id="terms" content={termsContent.da}/>
      <LegalTextContent id="cookies" content={cookieContent.da}/>
      <section className="legal-section" id="complaints"><h2>Klager</h2><p>Kontakt først {COMPANY_IDENTITY} på <a href="mailto:info@veyrosystems.com">info@veyrosystems.com</a>, hvis du har en klage over Circle.</p><p>Hvis vi ikke finder en løsning på en forbrugerklage, kan du undersøge <a href="https://naevneneshus.dk/naevnsoversigt/">klageorganerne hos Nævnenes Hus</a>. Det afhænger blandt andet af sagstype, beløbsgrænser og organets kompetence, om sagen kan behandles. Ved grænseoverskridende handel i EU/EØS kan <a href="https://forbrugereuropa.dk/">Forbruger Europa</a> vejlede. En privat tvist med en anden bruger er adskilt fra en klage over Circle.</p><p>Klager om personoplysninger kan indgives til <a href="https://www.datatilsynet.dk/">Datatilsynet</a> eller en anden kompetent datatilsynsmyndighed.</p></section>
      <section className="legal-section" id="safety"><h2>Sikkerhed, identitet og ansvar</h2><p>Parterne bør kontrollere hinandens navn og adresse ved at se gyldig legitimation, gennemgå aftalen sammen og underskrive på telefonen eller på papir. Undgå at kopiere eller fotografere legitimation, medmindre der er et konkret og lovligt behov.</p><p>Beskriv tingens stand, pris, depositum, periode, aflevering og eventuelle skader i aftalen. Veyro Circle stiller platform og aftaleværktøj til rådighed, men kan ikke garantere en brugers identitet, en tings stand eller at en privat aftale bliver opfyldt.</p></section>
      <footer><p>{COMPANY_IDENTITY}</p></footer>
    </article>
  </main>;
}
