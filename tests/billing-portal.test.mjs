import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';

function harness(t,options={}){
  const profile={subscriptionPlan:'plus',stripeCustomerId:'cus_stored',...options.profile};
  const calls=[];
  const load=createTsLoader({
    '@/lib/firebase-server':{verifyFirebaseRequest:async()=>{if(options.unauthenticated)throw Error('Login required');return {localId:'uid_verified',email:'member@example.invalid'};},getServerProfile:async()=>profile},
    '@/lib/server-config':{serverConfig:key=>{assert.equal(key,'STRIPE_SECRET_KEY');return 'unit-test-placeholder';}},
  });
  const originalFetch=globalThis.fetch;t.after(()=>{globalThis.fetch=originalFetch;});
  globalThis.fetch=async(input,init={})=>{
    const url=new URL(input);assert.equal(url.origin,'https://api.stripe.com');
    const path=url.pathname.replace('/v1',''),method=init.method??'GET',body=init.body?new URLSearchParams(init.body):undefined;
    calls.push({path,method,body,query:url.searchParams});
    if(path==='/customers/cus_stored'){
      if(options.customerFailure)return Response.json({error:{code:options.customerFailure===404?'resource_missing':'permission_denied',message:'private-secret-marker'}},{status:options.customerFailure});
      return Response.json(options.storedCustomer??{id:'cus_stored',metadata:{uid:'uid_verified'}});
    }
    if(path==='/customers'){
      assert.equal(url.searchParams.get('email'),'member@example.invalid');
      const pages=options.pages??[{data:options.customers??[{id:'cus_live',metadata:{uid:'uid_verified'}}],has_more:false}];
      return Response.json(pages[url.searchParams.has('starting_after')?1:0]);
    }
    if(path==='/billing_portal/sessions'){
      assert.equal(method,'POST');return Response.json({url:'https://billing.stripe.com/p/session/unit-test'});
    }
    throw Error('Unexpected Stripe operation '+path);
  };
  const route=load('@/app/api/stripe/portal/route');
  return {calls,profile,open:()=>route.POST(new Request('https://circle.example.invalid/api/stripe/portal',{method:'POST',body:JSON.stringify({customer:'cus_forged',return_url:'https://untrusted.example.invalid'})}))};
}
const portals=h=>h.calls.filter(call=>call.path==='/billing_portal/sessions');

test('portal uses the authenticated stored customer and server return URL without changing billing data',async t=>{
  const h=harness(t),before=structuredClone(h.profile),response=await h.open();
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');
  assert.equal(portals(h)[0].body.get('customer'),'cus_stored');
  assert.equal(portals(h)[0].body.get('return_url'),'https://circle.example.invalid/?billing=return');
  assert.deepEqual(h.profile,before);assert.deepEqual(h.calls.map(c=>c.method),['GET','POST']);
});
test('legacy stored Live customer without UID metadata remains supported',async t=>{const h=harness(t,{storedCustomer:{id:'cus_stored',metadata:{}}});assert.equal((await h.open()).status,200);assert.equal(portals(h)[0].body.get('customer'),'cus_stored');});
test('stale Sandbox customer resolves to the unique Live customer with matching Firebase UID',async t=>{
  const h=harness(t,{customerFailure:404}),before=structuredClone(h.profile);assert.equal((await h.open()).status,200);
  assert.equal(portals(h)[0].body.get('customer'),'cus_live');assert.deepEqual(h.profile,before);
  assert.ok(h.calls.every(c=>c.method==='GET'||c.path==='/billing_portal/sessions'));
});
test('deleted customer uses the same verified recovery path',async t=>{const h=harness(t,{storedCustomer:{id:'cus_stored',deleted:true}});assert.equal((await h.open()).status,200);assert.equal(portals(h)[0].body.get('customer'),'cus_live');});
test('recovery follows pagination before choosing a billing customer',async t=>{
  const h=harness(t,{customerFailure:404,pages:[{data:[{id:'cus_other',metadata:{uid:'another_user'}}],has_more:true},{data:[{id:'cus_live',metadata:{uid:'uid_verified'}}],has_more:false}]});
  assert.equal((await h.open()).status,200);assert.equal(h.calls.filter(c=>c.path==='/customers').length,2);assert.equal(portals(h)[0].body.get('customer'),'cus_live');
});
for(const customers of [[],[{id:'cus_same_email',metadata:{}}],[{id:'cus_wrong_owner',metadata:{uid:'another_user'}}],[{id:'cus_one',metadata:{uid:'uid_verified'}},{id:'cus_two',metadata:{uid:'uid_verified'}}]])test('missing or ambiguous verified owner never creates a customer, subscription or portal',async t=>{
  const h=harness(t,{customerFailure:404,customers}),response=await h.open();assert.equal(response.status,409);assert.equal((await response.json()).code,'BILLING_PORTAL_CUSTOMER_MISSING');assert.equal(portals(h).length,0);assert.ok(h.calls.every(c=>c.method==='GET'));
});
test('mismatched UID on the stored customer fails closed',async t=>{const h=harness(t,{storedCustomer:{id:'cus_stored',metadata:{uid:'another_user'}}});assert.equal((await h.open()).status,400);assert.equal(h.calls.length,1);assert.equal(portals(h).length,0);});
for(const customerFailure of [403,500])test(`Stripe HTTP ${customerFailure} cannot silently rebind the customer or reveal Stripe errors`,async t=>{
  const h=harness(t,{customerFailure}),response=await h.open();assert.equal(response.status,400);assert.equal(h.calls.length,1);assert.doesNotMatch(await response.text(),/private-secret-marker/);assert.equal(portals(h).length,0);
});
test('free signup without billing history does not call Stripe to open an empty portal',async t=>{const h=harness(t,{profile:{subscriptionPlan:'free',stripeCustomerId:undefined}});assert.equal((await h.open()).status,409);assert.equal(h.calls.length,0);});
test('authentication failure never reaches Stripe',async t=>{const h=harness(t,{unauthenticated:true});assert.equal((await h.open()).status,400);assert.equal(h.calls.length,0);});
