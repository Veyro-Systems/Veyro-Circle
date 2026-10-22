import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import {createTsLoader as loader} from './load-typescript.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
const load=loader(),regions=load('@/lib/region'),market=load('@/lib/marketplace');

test('Norway extends supported regions and keeps language independent of currency',()=>{
  assert.deepEqual(regions.COUNTRIES,['DK','SE','NO']);
  assert.deepEqual(regions.LANGUAGES,['da','sv','nb']);
  assert.equal(regions.regions.NO.currency,'NOK');assert.equal(regions.regions.NO.monthlyPrice,41);
  for(const lang of regions.LANGUAGES){assert.match(market.money(6900,'NO',lang),/69/);assert.match(market.money(6900,'NO',lang),/NOK/);}
  assert.equal(regions.storedCountry('NO'),'NO');assert.equal(regions.storedLanguage('nb'),'nb');
  assert.equal(regions.isCountry('FI'),false);assert.equal(regions.isLang('unknown'),false);
});

test('every existing Danish and Swedish postal ID is preserved when Norway is appended',()=>{
  const data=JSON.parse(readFileSync(path.join(root,'data/postal-places.json'),'utf8'));
  assert.equal(createHash('sha256').update(JSON.stringify(data.slice(0,20046))).digest('hex'),'c8187a2fff076470e9d58bf4a2339a19ad5862e7a0f223bb41275c3e8fc19d06');
  assert.ok(data.slice(20046).every(row=>row[0]==='NO'));assert.ok(data.length>25000);
  assert.ok(market.searchPlaces('Oslo','NO').length);assert.ok(market.searchPlaces('Bergen','NO').length);assert.ok(market.searchPlaces('Tromso','NO').length);assert.ok(market.searchPlaces('Kirkenes','NO').length);
  assert.ok(market.searchPlaces('0010','NO').some(p=>p.postcode==='0010'));
  const oslo=market.searchPlaces('Oslo','NO')[0];assert.equal(market.validProfile('Testperson','Storgata 12',oslo,'+47 91234567'),true);
});

test('saved searches accept Norway and reject unsupported country values',()=>{
  const {cleanSearch}=load('@/lib/discovery');
  const search={query:'tilhenger',country:'NO',category:'transport',price:'all',radius:'all',placeId:''};
  assert.equal(cleanSearch(search)?.country,'NO');assert.equal(cleanSearch({...search,country:'FI'}),null);
});

test('Norwegian offer and country-specific tax acknowledgement are complete',()=>{
  const {circlePlusOffer}=load('@/lib/circle-plus-copy'),tax=load('@/lib/tax-guidance');
  for(const lang of regions.LANGUAGES){assert.equal(circlePlusOffer(lang,'NO').price,'41 NOK');assert.match(circlePlusOffer(lang,'NO').renewal,/41 NOK/);assert.equal(circlePlusOffer(lang,'NO').headline,'41 NOK');assert.doesNotMatch(circlePlusOffer(lang,'NO').headline,/180/);assert.ok(tax.taxRows[lang].every(row=>row.NO));}
  assert.equal(tax.taxGuidanceVersion('DK'),'2026-09-05');assert.equal(tax.taxGuidanceVersion('SE'),'2026-09-05');assert.equal(tax.taxGuidanceVersion('NO'),'2026-10-21-no');
  assert.equal(tax.hasReadTaxGuidance({version:'2026-09-05',country:'DK',acceptedAt:'2026-10-01'},'DK'),true);
  assert.ok(tax.taxSources.filter(s=>s.id.startsWith('no')).every(s=>s.href.startsWith('https://www.skatteetaten.no/')));
});

test('all referenced Norwegian UI strings exist and are nonempty',()=>{
  const {nbText}=load('@/lib/norwegian-copy');let references=0;
  const walk=dir=>{for(const entry of readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){if(entry.name!=='ui')walk(file);continue;}if(!/\.tsx?$/.test(file))continue;const sf=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);function visit(n){if(ts.isElementAccessExpression(n)&&n.expression.getText(sf)==='nbText'&&ts.isStringLiteral(n.argumentExpression)){references++;assert.ok(nbText[n.argumentExpression.text]?.trim(),`Missing Norwegian text in ${path.relative(root,file)}: ${n.argumentExpression.text}`);}ts.forEachChild(n,visit);}visit(sf);}};
  ['app','components','lib'].forEach(dir=>walk(path.join(root,dir)));assert.ok(references>600);
});

test('Norwegian notifications contain no private account or message details',()=>{
  const {pushPayload}=load('@/lib/push-server');
  assert.equal(pushPayload('message','test-id','nb').body,'Du har fått en ny melding i Circle.');
  assert.match(pushPayload('search','test-id','nb').body,/lagrede søket/);
  assert.deepEqual(Object.keys(pushPayload('requested','test-id','nb')).sort(),['body','tag','title','url']);
});

function profileHarness(){
  const existing={fields:{subscriptionPlan:{stringValue:'plus'},stripeSubscriptionId:{stringValue:'sub_existing'},circlePlusStartedAt:{timestampValue:'2026-01-01T00:00:00Z'}},updateTime:'old'};
  const writes=[];
  const loadRoute=loader({
    '@/lib/firebase-server':{verifyFirebaseRequest:async()=>({localId:'unit-norway',email:'unit@example.invalid'}),getFirestoreDocument:async key=>key==='users/unit-norway'?existing:null,firestoreDocumentName:key=>key,commitFirestoreWrites:async items=>writes.push(...items)},
    '@/lib/server-config':{serverConfig:()=> 'unit-identity-key-not-a-secret'},
  });
  return {route:loadRoute('@/app/api/profile/route'),writes};
}

test('Norwegian profile accepts +47/local phones and preserves existing billing fields',async()=>{
  for(const phone of ['91234567','+47 91234567','004791234567']){
    const h=profileHarness(),place=market.searchPlaces('Oslo','NO')[0];
    const response=await h.route.POST(new Request('https://unit.example.invalid/api/profile',{method:'POST',body:JSON.stringify({name:'Testperson',email:'unit@example.invalid',phone,street:'Storgata 12',place,preferredLanguage:'nb'})}));
    assert.equal(response.status,200);
    const update=h.writes.find(w=>w.update?.name==='users/unit-norway');assert.equal(update.update.fields.preferredLanguage.stringValue,'nb');assert.equal(update.update.fields.place.mapValue.fields.country.stringValue,'NO');
    for(const field of ['subscriptionPlan','stripeSubscriptionId','circlePlusStartedAt'])assert.equal(update.updateMask.fieldPaths.includes(field),false);
    const fingerprint=createHmac('sha256','unit-identity-key-not-a-secret').update('phone:4791234567').digest('hex');assert.ok(h.writes.some(w=>w.update?.name===`accountIdentityPhones/${fingerprint}`));
  }
});

test('Norwegian language update writes only language preference and update time',async()=>{
  const h=profileHarness();const response=await h.route.PATCH(new Request('https://unit.example.invalid/api/profile',{method:'PATCH',body:JSON.stringify({preferredLanguage:'nb',subscriptionPlan:'plus'})}));assert.equal(response.status,200);
  assert.deepEqual(h.writes[0].updateMask.fieldPaths,['preferredLanguage','updatedAt']);
});
