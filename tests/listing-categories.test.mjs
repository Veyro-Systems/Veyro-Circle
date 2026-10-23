import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const load=createTsLoader(),{listingCategories,childCategory,categoryLabel,matchesCategory}=load('@/lib/listing-categories'),{cleanSearch,matchesSearch}=load('@/lib/discovery'),{places}=load('@/lib/marketplace');
test('existing main category IDs are preserved and every subcategory is translated',()=>{
 assert.deepEqual(listingCategories.map(c=>c.id).sort(),['transport','tools','garden','leisure','party','kitchen','bike','other'].sort());
 const ids=new Set();for(const category of listingCategories){assert.ok(category.children.length>0);for(const child of category.children){assert.ok(!ids.has(child.id));ids.add(child.id);for(const lang of ['da','sv','nb']){assert.ok(category[lang]);assert.ok(child[lang]);assert.equal(categoryLabel(category.id,child.id,lang),child[lang]);}assert.ok(child.terms.length);}}
 assert.equal(childCategory('garden','trailers'),undefined);assert.equal(childCategory('all','trailers'),undefined);
});
test('legacy listings remain searchable without database migration in all three languages',()=>{
 for(const name of ['Boremaskine','Borrmaskin','Bormaskin'])assert.ok(matchesCategory({category:'tools',name,description:''},'tools','drills'));
 for(const name of ['Græsslåmaskine','Gräsklippare','Gressklipper'])assert.ok(matchesCategory({category:'garden',name,description:''},'garden','mowers'));
 const item={category:'bike',name:'Thule cykelstativ',description:'Til bilen'},copy=structuredClone(item);assert.ok(matchesCategory(item,'bike','bike-carriers'));assert.deepEqual(item,copy);assert.ok(matchesCategory(item,'all'));assert.ok(matchesCategory(item,'bike'));assert.ok(!matchesCategory(item,'tools','drills'));assert.ok(!matchesCategory(item,'bike','unknown'));
});
test('an explicit owner classification takes precedence over keyword fallback',()=>{
 const item={category:'tools',subcategory:'building',name:'Slibemaskine',description:'Kan bruges efter en boremaskine'};assert.equal(matchesCategory(item,'tools','building'),true);assert.equal(matchesCategory(item,'tools','drills'),false);assert.equal(matchesCategory(item,'garden','building'),false);
});
test('saved search validation is backward compatible and rejects mismatched or forged subcategories',()=>{
 const original={query:'  test ',country:'ALL',category:'tools',price:'all',radius:'all',placeId:''};assert.deepEqual(cleanSearch(original),{...original,query:'test'});
 assert.equal(cleanSearch({...original,subcategory:'drills'}).subcategory,'drills');assert.equal(cleanSearch({...original,subcategory:''}).subcategory,undefined);
 for(const value of ['trailers','unknown',null,[],{},123])assert.equal(cleanSearch({...original,subcategory:value}),null);
 assert.equal(cleanSearch({...original,category:'all',subcategory:'drills'}),null);
});
test('subcategories combine with text, price, country and distance in saved searches and alerts',()=>{
 const place=places.find(p=>p.country==='DK'&&p.postcode==='4174'),item={name:'Boremaskine',description:'Bosch',city:place.city,country:'DK',category:'tools',subcategory:'drills',dailyPrice:2900,place};
 const search={query:'bosch',country:'DK',category:'tools',subcategory:'drills',price:'paid',radius:'10',placeId:place.id};assert.equal(matchesSearch(search,item),true);
 for(const override of [{query:'makita'},{subcategory:'saws'},{price:'free'},{country:'SE'}])assert.equal(matchesSearch({...search,...override},item),false);
 assert.equal(matchesSearch({...search,subcategory:undefined},item),true);
});
