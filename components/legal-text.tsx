import type {LegalText} from "@/lib/privacy-policy";
import {COMPANY} from "@/lib/company";

export function CompanyContact() {
  return <address className="legal-contact"><span>{COMPANY.street}, {COMPANY.city}, {COMPANY.country}</span><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></address>;
}

export function LegalTextContent({content,id}:{content:LegalText;id:string}) {
  return <section className="legal-section" id={id}><h2>{content.title}</h2><p>{content.intro}</p>{content.sections.map(section=><div className="legal-subsection" key={section.id} id={`${id}-${section.id}`}><h3>{section.title}</h3>{section.paragraphs?.map((p,i)=><p key={i}>{p}</p>)}{section.items&&<ul>{section.items.map((item,i)=><li key={i}>{item}</li>)}</ul>}{section.links&&<ul className="legal-links">{section.links.map(link=><li key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></li>)}</ul>}</div>)}</section>;
}
