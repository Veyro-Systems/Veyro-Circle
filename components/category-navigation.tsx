"use client";
import {listingCategories} from "@/lib/listing-categories";
import type {Lang} from "@/lib/region";
import {Bike,Truck,Wrench,Sprout,TentTree,PartyPopper,Utensils,PackageOpen,LayoutGrid} from "lucide-react";
const icons={bike:Bike,transport:Truck,tools:Wrench,garden:Sprout,leisure:TentTree,party:PartyPopper,kitchen:Utensils,other:PackageOpen};
export const categoryNavigationCopy={da:{title:"Kategorier",all:"Alle ting",inCategory:"Alt i kategorien"},sv:{title:"Kategorier",all:"Alla saker",inCategory:"Allt i kategorin"},nb:{title:"Kategorier",all:"Alle ting",inCategory:"Alt i kategorien"}};
export function CategoryNavigation({lang,category,subcategory,onSelect}:{lang:Lang;category:string;subcategory:string;onSelect:(category:string,subcategory?:string)=>void}){
 const c=categoryNavigationCopy[lang];
 return <nav className="category-navigation" aria-label={c.title}><h2>{c.title}</h2><button type="button" className="category-all" aria-pressed={category==="all"} onClick={()=>onSelect("all")}><LayoutGrid size={18}/>{c.all}</button>
  {listingCategories.map(item=>{const Icon=icons[item.id as keyof typeof icons];return <details key={item.id} open={category===item.id}><summary><Icon size={18}/><span>{item[lang]}</span></summary><div className="category-children"><button type="button" aria-pressed={category===item.id&&!subcategory} onClick={()=>onSelect(item.id)}>{c.inCategory}</button>{item.children.map(child=><button key={child.id} type="button" aria-pressed={category===item.id&&subcategory===child.id} onClick={()=>onSelect(item.id,child.id)}>{child[lang]}</button>)}</div></details>;})}
 </nav>;
}
