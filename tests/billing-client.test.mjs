import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const compiled=ts.transpileModule(readFileSync(new URL('../lib/billing-client.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const client={};new Function('exports',compiled)(client);

test('Checkout sends the reviewed offer and never redirects when the server changes it',async t=>{
  const originalFetch=globalThis.fetch,originalWindow=globalThis.window;
  t.after(()=>{globalThis.fetch=originalFetch;globalThis.window=originalWindow;});
  const redirects=[],requests=[];
  globalThis.window={location:{assign:url=>redirects.push(url)}};
  const user={getIdToken:async()=>'unit-test-token'};
  const offer={expectedTrialEligible:false,expectedOfferVersion:5,expectedCountry:'SE',lang:'sv'};
  globalThis.fetch=async(url,options)=>{
    requests.push({url,options});
    return Response.json({code:'BILLING_OFFER_CHANGED',error:'Review the offer'},{status:409});
  };
  await assert.rejects(client.openBilling(user,'checkout'),client.BillingOfferChangedError);
  assert.equal(requests.length,0);
  await assert.rejects(client.openBilling(user,'checkout',offer),client.BillingOfferChangedError);
  assert.equal(requests[0].url,'/api/stripe/checkout');
  assert.deepEqual(JSON.parse(requests[0].options.body),offer);
  assert.deepEqual(redirects,[]);
  globalThis.fetch=async()=>Response.json({url:'https://checkout.stripe.com/test-review'});
  await client.openBilling(user,'checkout',offer);
  assert.deepEqual(redirects,['https://checkout.stripe.com/test-review']);
  await client.openBilling(user,'portal');
  assert.equal(redirects.length,2);
});

test('missing billing account is distinct from a payment failure and never redirects to Checkout',async t=>{
  const originalFetch=globalThis.fetch,originalWindow=globalThis.window;
  t.after(()=>{globalThis.fetch=originalFetch;globalThis.window=originalWindow;});
  const redirects=[];globalThis.window={location:{assign:url=>redirects.push(url)}};
  globalThis.fetch=async()=>Response.json({code:'BILLING_PORTAL_CUSTOMER_MISSING',error:'No billing account for this login'},{status:409});
  await assert.rejects(client.openBilling({getIdToken:async()=>'unit-test-token'},'portal'),client.BillingPortalUnavailableError);
  assert.deepEqual(redirects,[]);
});
