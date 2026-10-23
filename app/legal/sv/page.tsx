import {termsContent} from "@/lib/terms-content";
import {LegalTextContent,CompanyContact} from "@/components/legal-text";
import {privacyContent,cookieContent} from "@/lib/privacy-policy";
import { COMPANY_IDENTITY } from "@/lib/company";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {title:"Juridisk information — Veyro Circle",description:"Integritet, GDPR, abonnemang, cookies, klagomål och säkerhet för Veyro Circle."};

export default function SwedishLegalPage() {
  return <main className="legal-page" lang="sv">
    <header className="legal-header"><div><Link href="/?lang=sv" aria-label="Till Veyro Circle"><Image src="/branding/veyro-systems-logo.png" alt="Veyro Systems" width={150} height={64}/></Link><Link href="/?lang=sv">← Tillbaka till Veyro Circle</Link></div></header>
    <article className="legal-content">
      <header><p className="eyebrow">Veyro Circle</p><h1>Juridisk information</h1><p>Information om behandling av personuppgifter, abonnemang, cookies, klagomål och ansvar. Senast uppdaterad 23 oktober 2026.</p></header>
      <section className="legal-section" id="company"><h2>Företagsuppgifter</h2><p>Veyro Circle tillhandahålls av {COMPANY_IDENTITY}.</p><CompanyContact/></section>
      <LegalTextContent id="privacy" content={privacyContent.sv}/>
      <LegalTextContent id="terms" content={termsContent.sv}/>
      <LegalTextContent id="cookies" content={cookieContent.sv}/>
      <section className="legal-section" id="complaints"><h2>Klagomål</h2><p>Kontakta först {COMPANY_IDENTITY} på <a href="mailto:info@veyrosystems.com">info@veyrosystems.com</a> om du har klagomål på Circle.</p><p>Om vi inte hittar en lösning kan du undersöka om <a href="https://www.arn.se/">Allmänna reklamationsnämnden</a> eller ett <a href="https://naevneneshus.dk/naevnsoversigt/">danskt klagomålsorgan</a> är behörigt. Ärendet måste uppfylla organets krav, inklusive tillämpliga beloppsgränser. Vid gränsöverskridande handel kan du söka vägledning hos konsumentkontoret i ditt hemland. En privat tvist med en annan användare är skild från ett klagomål på Circle.</p><p>Klagomål om personuppgifter kan lämnas till <a href="https://www.imy.se/">Integritetsskyddsmyndigheten</a> eller en annan behörig dataskyddsmyndighet.</p></section>
      <section className="legal-section" id="safety"><h2>Säkerhet, identitet och ansvar</h2><p>Parterna bör kontrollera varandras namn och adress genom att se giltig legitimation, gå igenom avtalet tillsammans och signera på telefonen eller på papper. Undvik att kopiera eller fotografera legitimation om det inte finns ett konkret och lagligt behov.</p><p>Beskriv sakens skick, pris, deposition, period, återlämning och eventuella skador i avtalet. Veyro Circle tillhandahåller plattformen och avtalsverktyget men kan inte garantera en användares identitet, en saks skick eller att ett privat avtal fullgörs.</p></section>
      <footer><p>{COMPANY_IDENTITY}</p></footer>
    </article>
  </main>;
}
