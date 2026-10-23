import type {Lang} from "./region";
type Child={id:string;da:string;sv:string;nb:string;terms:string[]};
type Category={id:string;da:string;sv:string;nb:string;children:Child[]};
export const listingCategories:Category[]=[
 {id:"transport",da:"Transport",sv:"Transport",nb:"Transport",children:[
  {id:"trailers",da:"Trailere",sv:"Släpvagnar",nb:"Tilhengere",terms:["trailer","släp","tilhenger"]},
  {id:"car-accessories",da:"Biltilbehør og tagbokse",sv:"Biltillbehör och takboxar",nb:"Biltilbehør og takbokser",terms:["tagboks","takbox","takboks","tagbøjle","takräcke","takstativ","biltilbehør","biltillbehör"]},
  {id:"moving",da:"Flytning og transportudstyr",sv:"Flytt och transportutrustning",nb:"Flytting og transportutstyr",terms:["sækkevogn","sackkärra","sekketralle","flytt","flyttekasse","transportvogn"]}]},
 {id:"tools",da:"Værktøj",sv:"Verktyg",nb:"Verktøy",children:[
  {id:"drills",da:"Boremaskiner og skruemaskiner",sv:"Borrmaskiner och skruvdragare",nb:"Bormaskiner og skrutrekkere",terms:["boremaskin","borrmaskin","bormaskin","skruemaskin","skruvdrag","skrutrekk","borehammer","borrhamm"]},
  {id:"saws",da:"Save og skæreværktøj",sv:"Sågar och skärverktyg",nb:"Sager og skjæreverktøy",terms:["rundsav","stiksav","kap-/gering","geringssav","sirkelsag","sticksåg","cirkelsåg","kapsag","stikksag","vinkelslib","vinkelslip"]},
  {id:"cleaning",da:"Tæpperensere og rengøring",sv:"Mattvätt och rengöring",nb:"Tepperensere og rengjøring",terms:["tæpperens","tekstilrens","tepperens","mattvätt","damprens","ångtvätt","støvsug","dammsug","rengør","rengör","rengjør"]},
  {id:"building",da:"Byggeri, slibning og maling",sv:"Bygg, slipning och målning",nb:"Bygging, sliping og maling",terms:["slibemaskin","slipmaskin","slipemaskin","stiger","stige","stege","malersprøjte","färgspruta","malingssprøyte","betonbland","blandare","sementbland"]}]},
 {id:"garden",da:"Have",sv:"Trädgård",nb:"Hage",children:[
  {id:"mowers",da:"Plæneklippere",sv:"Gräsklippare",nb:"Gressklippere",terms:["plæneklip","græsslå","gräsklipp","gressklipp"]},
  {id:"hedges",da:"Hækklippere og beskæring",sv:"Häcksaxar och beskärning",nb:"Hekksakser og beskjæring",terms:["hækklip","hæksaks","hækkesaks","häcksax","hekksaks","beskær","beskär","beskjær"]},
  {id:"garden-machines",da:"Havemaskiner",sv:"Trädgårdsmaskiner",nb:"Hagemaskiner",terms:["løvblæs","løvsug","lövblås","lövstäd","løvblås","motorsav","motorsåg","motorsag","jordfræs","jordfräs","jordfres"]},
  {id:"garden-equipment",da:"Haveredskaber",sv:"Trädgårdsredskap",nb:"Hageredskaper",terms:["havesaks","hagesaks","trillebør","skottkärra","trillebår","spade","rive","kratta"]}]},
 {id:"leisure",da:"Fritid",sv:"Fritid",nb:"Fritid",children:[
  {id:"camping",da:"Camping og friluftsliv",sv:"Camping och friluftsliv",nb:"Camping og friluftsliv",terms:["camping","telt","tält","sovepose","sovsäck","liggeunderlag","rygsæk","ryggsäck","ryggsekk"]},
  {id:"water",da:"Vandsport",sv:"Vattensport",nb:"Vannsport",terms:["kajak","kajakk","kano","kanot","paddleboard","sup-board","våddragt","våtdräkt","våtdrakt"]},
  {id:"sports",da:"Sport og spil",sv:"Sport och spel",nb:"Sport og spill",terms:["sport","spil","spel","spill","ski","golf","padel","tennis"]}]},
 {id:"party",da:"Fest",sv:"Fest",nb:"Fest",children:[
  {id:"sound-light",da:"Lyd og lys",sv:"Ljud och ljus",nb:"Lyd og lys",terms:["højttaler","högtalare","høyttaler","soundboks","lydanlæg","ljudanlägg","lydanlegg","diskolys","discoljus","mikrofon"]},
  {id:"tables-chairs",da:"Borde og stole",sv:"Bord och stolar",nb:"Bord og stoler",terms:["festbord","feststol","klapbord","klapstol","fällbord","fällstol","bord og","bord och","bord med","stole","stolar","stoler"]},
  {id:"party-tents",da:"Festtelte og pavilloner",sv:"Partytält och paviljonger",nb:"Partytelt og paviljonger",terms:["festtelt","partytelt","partytält","pavillon","paviljong"]},
  {id:"entertainment",da:"Leg og underholdning",sv:"Lek och underhållning",nb:"Lek og underholdning",terms:["hoppeborg","hoppborg","hoppeslott","karaoke","slush","popcorn","sukkerspind","sockervadd","sukkerspinn"]}]},
 {id:"kitchen",da:"Køkken",sv:"Kök",nb:"Kjøkken",children:[
  {id:"kitchen-machines",da:"Køkkenmaskiner",sv:"Köksmaskiner",nb:"Kjøkkenmaskiner",terms:["køkkenmaskin","köksmaskin","kjøkkenmaskin","røremaskin","bakmaskin","blender","foodprocessor","mixer"]},
  {id:"coffee",da:"Kaffe og drikke",sv:"Kaffe och dryck",nb:"Kaffe og drikke",terms:["kaffe","coffee","espresso","juice","drikke","dryck"]},
  {id:"cooking-serving",da:"Madlavning og servering",sv:"Matlagning och servering",nb:"Matlaging og servering",terms:["grill","pizzaovn","pizzaugn","pizzovn","gryde","gryta","kjele","service","bestik","bestick","bestikk","servering"]}]},
 {id:"bike",da:"Cykler",sv:"Cyklar",nb:"Sykler",children:[
  {id:"bicycles",da:"Cykler og ladcykler",sv:"Cyklar och lastcyklar",nb:"Sykler og lastesykler",terms:["ladcykel","lastcykel","lastesykkel","elcykel","elsykkel","mountainbike","racercykel","racersykkel","børnecykel","barncykel","barnesykkel"]},
  {id:"bike-carriers",da:"Cykelstativer til bilen",sv:"Cykelhållare till bilen",nb:"Sykkelstativ til bilen",terms:["cykelstativ","cykelhållare","cykelholder","sykkelstativ","sykkelholder"]},
  {id:"bike-bags",da:"Cykeltasker og transportkufferter",sv:"Cykelväskor och transportväskor",nb:"Sykkelvesker og transportkofferter",terms:["cykeltransport","cykelkuffert","cykelväska","sykkelveske","sykkelkoffert","cykeltaske"]},
  {id:"bike-accessories",da:"Cykeltilbehør",sv:"Cykeltillbehör",nb:"Sykkeltilbehør",terms:["cykelhjelm","cykelhjälm","sykkelhjelm","cykelpumpe","cykelpump","sykkelpumpe","cykeltrailer","sykkelvogn"]}]},
 {id:"other",da:"Andet",sv:"Övrigt",nb:"Annet",children:[
  {id:"electronics",da:"Foto og elektronik",sv:"Foto och elektronik",nb:"Foto og elektronikk",terms:["kamera","projektor","elektronik","drone","dator","computer","skærm","skärm"]},
  {id:"children",da:"Børn og baby",sv:"Barn och baby",nb:"Barn og baby",terms:["barnevogn","barnvagn","autostol","bilstol","babyseng","rejseseng","resesäng","reiseseng"]},
  {id:"clothing",da:"Tøj og udklædning",sv:"Kläder och utklädnad",nb:"Klær og utkledning",terms:["kostume","kostym","kjole","klänning","udklæd","utkläd","utkled","smoking"]}]},
];
export function childCategory(category:string,subcategory:unknown){return typeof subcategory==="string"?listingCategories.find(c=>c.id===category)?.children.find(c=>c.id===subcategory):undefined;}
export function categoryLabel(category:string,subcategory:string|undefined,lang:Lang){return childCategory(category,subcategory)?.[lang]??listingCategories.find(c=>c.id===category)?.[lang]??"";}
export function matchesCategory(item:{category:string;subcategory?:string;name:string;description:string},category:string,subcategory?:string){
 if(category==="all")return !subcategory;
 if(item.category!==category)return false;
 if(!subcategory)return true;
 const child=childCategory(category,subcategory);if(!child)return false;
 if(item.subcategory)return item.subcategory===subcategory;
 // Existing listings retain their category and data. Only unclassified listings use keyword matching.
 const text=`${item.name} ${item.description}`.toLocaleLowerCase();return child.terms.some(term=>text.includes(term));
}
