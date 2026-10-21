
import { nbText } from "@/lib/norwegian-copy";
export const detailFields:Record<string,Array<{key:string;da:string;sv:string;nb:string}>>={
 transport:[{key:"dimensions",da:"Ladmål / plads",sv:"Lastmått / utrymme", nb: nbText["Ladmål / plads"] },{key:"payload",da:"Tilladt lasteevne (kg)",sv:"Tillåten lastvikt (kg)", nb: nbText["Tilladt lasteevne (kg)"] },{key:"connection",da:"Stik og tilkobling",sv:"Kontakt och koppling", nb: nbText["Stik og tilkobling"] }],
 tools:[{key:"model",da:"Mærke og model",sv:"Märke och modell", nb: nbText["Mærke og model"] },{key:"power",da:"Batteri eller strøm",sv:"Batteri eller el", nb: nbText["Batteri eller strøm"] },{key:"accessories",da:"Medfølgende tilbehør",sv:"Tillbehör som ingår", nb: nbText["Medfølgende tilbehør"] }],
 garden:[{key:"model",da:"Mærke og model",sv:"Märke och modell", nb: nbText["Mærke og model"] },{key:"power",da:"Batteri / strøm / brændstof",sv:"Batteri / el / bränsle", nb: nbText["Batteri / strøm / brændstof"] },{key:"accessories",da:"Medfølgende tilbehør",sv:"Tillbehör som ingår", nb: nbText["Medfølgende tilbehør"] }],
 leisure:[{key:"size",da:"Størrelse og kapacitet",sv:"Storlek och kapacitet", nb: nbText["Størrelse og kapacitet"] },{key:"accessories",da:"Medfølgende tilbehør",sv:"Tillbehör som ingår", nb: nbText["Medfølgende tilbehør"] }],
 party:[{key:"capacity",da:"Antal personer / kapacitet",sv:"Antal personer / kapacitet", nb: nbText["Antal personer / kapacitet"] },{key:"setup",da:"Opsætning og strømbehov",sv:"Montering och elbehov", nb: nbText["Opsætning og strømbehov"] }],
 kitchen:[{key:"capacity",da:"Kapacitet",sv:"Kapacitet", nb: nbText["Kapacitet"] },{key:"cleaning",da:"Rengøring ved retur",sv:"Rengöring vid återlämning", nb: nbText["Rengøring ved retur"] }],
 bike:[{key:"size",da:"Stelstørrelse / passende højde",sv:"Ramstorlek / passande längd", nb: nbText["Stelstørrelse / passende højde"] },{key:"type",da:"Cykeltype",sv:"Cykeltyp", nb: nbText["Cykeltype"] },{key:"accessories",da:"Lås, hjelm og andet tilbehør",sv:"Lås, hjälm och andra tillbehör", nb: nbText["Lås, hjelm og andet tilbehør"] }],
};
export function cleanDetails(category:string,input:unknown):Record<string,string> {
  if(!input || typeof input!=="object" || Array.isArray(input))return {};
  const data=input as Record<string,unknown>;
  return Object.fromEntries((detailFields[category]??[]).flatMap(({key})=>typeof data[key]==="string" && data[key].trim() ? [[key,data[key].trim().slice(0,200)]]:[]));
}
