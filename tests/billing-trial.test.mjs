import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHmac,generateKeyPairSync} from 'node:crypto';
import ts from 'typescript';

// Exercise the actual routes and HTTP client. Firebase/Stripe boundaries are
// in-memory doubles; no production credentials or customer records are used.
function harness(t,options={}){
  const profile={subscriptionPlan:'free',country:'DK',...options.profile};
  const customers=structuredClone(options.customers??[]);
  const subscriptions=structuredClone(options.subscriptions??[]);
  const documents=new Map();const sessions=new Map();const idempotency=new Map();
  const calls=[];const updates=[];let version=0;let loseResponse=options.loseResponse;
  const config={STRIPE_SECRET_KEY:'unit-test-credential',STRIPE_WEBHOOK_SECRET:'unit-webhook-signing',STRIPE_PRICE_DKK:'price_dk_existing',STRIPE_PRICE_SEK:'price_se_existing'};
  const firebase={
    verifyFirebaseRequest:async()=>{if(options.unauthenticated)throw Error('Login required');return {localId:'user-one',email:'member@example.invalid'};},
    getServerProfile:async()=>({...profile}),
    getFirestoreDocument:async path=>structuredClone(documents.get(path)??null),
    firestoreDocumentName:path=>path,
    commitFirestoreWrites:async writes=>{
      for(const write of writes){
        const current=documents.get(write.update.name);
        if(write.currentDocument?.exists===false && current || write.currentDocument?.updateTime && current?.updateTime!==write.currentDocument.updateTime)throw Error('IDENTITY_CONFLICT');
      }
      for(const write of writes)documents.set(write.update.name,{...structuredClone(write.update),updateTime:String(++version)});
    },
    findUserByStripeCustomer:async id=>profile.stripeCustomerId===id?'user-one':undefined,
    updateSubscription:async(uid,values)=>{assert.equal(uid,'user-one');updates.push(values);},
  };
  const cache=new Map();
  const load=path=>{
    if(path==='@/lib/firebase-server')return firebase;
    if(path==='@/lib/server-config')return {serverConfig:key=>{if(!config[key])throw Error('Missing configuration');return config[key];}};
    if(cache.has(path))return cache.get(path);
    const source=new URL(`../${path.replace('@/','')}.ts`,import.meta.url);
    const compiled=ts.transpileModule(readFileSync(source,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    const exports={};cache.set(path,exports);new Function('require','exports',compiled)(load,exports);return exports;
  };
  const originalFetch=globalThis.fetch;t.after(()=>{globalThis.fetch=originalFetch;});
  globalThis.fetch=async(input,init={})=>{
    const url=new URL(input);assert.equal(url.origin,'https://api.stripe.com');
    const path=url.pathname.replace('/v1','');const method=init.method??'GET';
    const body=init.body?new URLSearchParams(init.body):null;
    calls.push({path,method,body,key:init.headers?.['Idempotency-Key']});
    const failure=(status,code)=>Response.json({error:{code,message:'sensitive-test-marker'}},{status});
    if(options.stripeFailure)return failure(options.stripeFailure,'api_error');
    if(path.startsWith('/prices/'))return Response.json({id:path.split('/').at(-1),product:'prod_circle_plus'});
    if(path.startsWith('/customers/') && method==='GET'){
      if(options.customerFailure)return failure(options.customerFailure,options.customerFailure===404?'resource_missing':'permission_denied');
      const customer=customers.find(c=>c.id===path.split('/').at(-1));return customer?Response.json(customer):failure(404,'resource_missing');
    }
    if(path==='/customers' && method==='GET'){
      if(options.paginateCustomers && !url.searchParams.has('starting_after'))return Response.json({data:customers.slice(0,1),has_more:true});
      return Response.json({data:options.paginateCustomers?customers.slice(1):customers,has_more:false});
    }
    if(path==='/subscriptions')return Response.json({data:subscriptions.filter(s=>s.customer===url.searchParams.get('customer')),has_more:false});
    if(path.startsWith('/subscriptions/')){
      const sub=subscriptions.find(s=>s.id===path.split('/').at(-1));return sub?Response.json(sub):failure(404,'resource_missing');
    }
    if(path==='/customers' && method==='POST'){
      const customer={id:'cus_new',email:body.get('email'),metadata:{uid:body.get('metadata[uid]')}};customers.push(customer);return Response.json(customer);
    }
    if(path==='/checkout/sessions' && method==='POST'){
      const key=init.headers['Idempotency-Key'];
      let session=idempotency.get(key);
      if(!session){session={id:`cs_${sessions.size+1}`,url:'https://checkout.stripe.test/session',status:'open',customer:body.get('customer'),currency:body.get('line_items[0][price]')==='price_se_existing'?'sek':'dkk'};sessions.set(session.id,session);idempotency.set(key,session);}
      if(loseResponse){loseResponse=false;throw Error('Network response lost');}
      return Response.json(session);
    }
    if(path.startsWith('/checkout/sessions/')){
      const id=path.split('/')[3];const session=sessions.get(id);
      if(path.endsWith('/expire'))session.status='expired';
      return Response.json(session);
    }
    throw Error(`Unexpected test request ${path}`);
  };
  const checkout=load('@/app/api/stripe/checkout/route');const webhook=load('@/app/api/stripe/webhook/route');
  const request=()=>new Request('https://circle.example.invalid/api/stripe/checkout',{method:'POST',body:JSON.stringify({country:'SE',trial_period_days:999})});
  const event=async(type,object,extra={})=>{
    const payload=JSON.stringify({id:'evt_test',livemode:false,type,data:{object},...extra});
    const time=String(Math.floor(Date.now()/1000));
    const signature=createHmac('sha256',config.STRIPE_WEBHOOK_SECRET).update(`${time}.${payload}`).digest('hex');
    return webhook.POST(new Request('https://circle.example.invalid/api/stripe/webhook',{method:'POST',body:payload,headers:{'stripe-signature':`t=${time},v1=${signature}`}}));
  };
  return {checkout,webhook,request,event,calls,updates,customers,subscriptions,sessions,documents,config,load,profile};
}
const created=h=>h.calls.filter(c=>c.path==='/checkout/sessions'&&c.method==='POST');
const subscription=(status='trialing',extra={})=>({id:'sub_one',customer:'cus_one',status,metadata:{uid:'user-one'},items:{data:[{price:{id:'price_dk_existing',product:'prod_circle_plus'}}]},trial_end:1800000000,cancel_at_period_end:false,...extra});

for(const country of ['DK','SE'])test(`new ${country} member receives 180 days, stored country price and mandatory payment collection`,async t=>{
  const h=harness(t,{profile:{country}});const r=await h.checkout.POST(h.request());assert.equal(r.status,200);
  const body=created(h)[0].body;assert.equal(body.get('subscription_data[trial_period_days]'),'180');assert.equal(body.get('payment_method_collection'),'always');
  assert.equal(body.get('line_items[0][price]'),country==='SE'?'price_se_existing':'price_dk_existing');
  assert.equal(body.get('subscription_data[trial_settings][end_behavior][missing_payment_method]'),'cancel');assert.equal(body.has('payment_method_types'),false);
});
test('eligibility inspection is read-only',async t=>{const h=harness(t);const r=await h.checkout.GET(h.request());assert.deepEqual(await r.json(),{trialEligible:true,hasSubscription:false});assert.equal(h.customers.length,0);assert.equal(h.documents.size,0);});
for(const field of ['stripeSubscriptionId','circlePlusStartedAt','circlePlusTrialStartedAt'])test(`permanent ${field} history prevents another trial`,async t=>{
  const h=harness(t,{profile:{[field]:'previous-history'}});assert.equal((await h.checkout.POST(h.request())).status,200);assert.equal(created(h)[0].body.has('subscription_data[trial_period_days]'),false);
});
test('canceled history across paginated legacy email customers prevents another trial',async t=>{
  const h=harness(t,{customers:[{id:'cus_empty'},{id:'cus_old'}],paginateCustomers:true,subscriptions:[subscription('canceled',{customer:'cus_old'})]});
  assert.equal((await h.checkout.POST(h.request())).status,200);assert.equal(created(h)[0].body.has('subscription_data[trial_period_days]'),false);
  assert.ok(h.calls.filter(c=>c.path==='/customers'&&c.method==='GET').length>=2);
});
test('a subscription to another Veyro product does not consume the Circle Plus trial',async t=>{
  const h=harness(t,{customers:[{id:'cus_one'}],subscriptions:[subscription('active',{metadata:{app:'another-veyro-product'},items:{data:[{price:{id:'price_other',product:'prod_other'}}]}})]});
  assert.equal((await h.checkout.POST(h.request())).status,200);assert.equal(created(h)[0].body.get('subscription_data[trial_period_days]'),'180');
});
test('a retired Circle Plus price still consumes the trial even without UID metadata',async t=>{
  const h=harness(t,{customers:[{id:'cus_one'}],subscriptions:[subscription('canceled',{metadata:{},items:{data:[{price:{id:'price_retired',product:'prod_circle_plus'}}]}})]});
  assert.equal((await h.checkout.POST(h.request())).status,200);assert.equal(created(h)[0].body.has('subscription_data[trial_period_days]'),false);
});
test('existing active profile creates no Stripe resources',async t=>{const h=harness(t,{profile:{subscriptionPlan:'plus'}});assert.equal((await h.checkout.POST(h.request())).status,400);assert.equal(h.calls.length,0);});
for(const status of ['active','trialing','past_due','incomplete','unpaid','paused'])test(`Stripe ${status} history blocks a duplicate despite a stale free profile`,async t=>{
  const h=harness(t,{customers:[{id:'cus_one'}],subscriptions:[subscription(status)]});assert.equal((await h.checkout.POST(h.request())).status,400);assert.equal(created(h).length,0);
});
test('missing legacy Sandbox customer is replaced without passing it into Checkout',async t=>{
  const h=harness(t,{profile:{stripeCustomerId:'cus_old_sandbox'},customerFailure:404});assert.equal((await h.checkout.POST(h.request())).status,200);assert.equal(created(h)[0].body.get('customer'),'cus_new');
});
for(const status of [403,500])test(`customer lookup HTTP ${status} fails closed without replacing the customer`,async t=>{
  const h=harness(t,{profile:{stripeCustomerId:'cus_existing'},customerFailure:status});const r=await h.checkout.POST(h.request());assert.equal(r.status,400);assert.equal(created(h).length,0);assert.equal(h.customers.length,0);assert.doesNotMatch(await r.text(),/sensitive-test-marker/);
});
test('two concurrent requests create only one session',async t=>{
  const h=harness(t);const responses=await Promise.all([h.checkout.POST(h.request()),h.checkout.POST(h.request())]);assert.equal(responses.filter(r=>r.status===200).length,1);assert.equal(h.sessions.size,1);
});
test('repeated clicks reuse the same open session',async t=>{const h=harness(t);await h.checkout.POST(h.request());await h.checkout.POST(h.request());assert.equal(h.sessions.size,1);assert.equal(created(h).length,1);});
test('changing profile country expires an open session in the old currency',async t=>{const h=harness(t);await h.checkout.POST(h.request());h.profile.country='SE';await h.checkout.POST(h.request());assert.equal(h.sessions.get('cs_1').status,'expired');assert.equal(created(h).at(-1).body.get('line_items[0][price]'),'price_se_existing');});
test('a lost Stripe response is retried using the same idempotency key',async t=>{
  const h=harness(t,{loseResponse:true});assert.equal((await h.checkout.POST(h.request())).status,400);assert.equal((await h.checkout.POST(h.request())).status,200);assert.equal(h.sessions.size,1);assert.equal(created(h)[0].key,created(h)[1].key);
});
test('authentication failure creates no resources',async t=>{const h=harness(t,{unauthenticated:true});assert.equal((await h.checkout.POST(h.request())).status,400);assert.equal(h.calls.length,0);assert.equal(h.documents.size,0);});
for(const status of ['trialing','active','past_due','canceled','unpaid','paused'])test(`subscription ${status} sets the correct entitlement from Stripe's current state`,async t=>{
  const h=harness(t,{subscriptions:[subscription(status)]});assert.equal((await h.event('customer.subscription.updated',{id:'sub_one',status:'active'})).status,200);
  assert.equal(h.updates[0].active,['trialing','active'].includes(status));assert.equal(h.updates[0].status,status);
});
test('trial cancellation retains access until the scheduled end and then removes it',async t=>{
  const h=harness(t,{subscriptions:[subscription('trialing',{cancel_at_period_end:true})]});await h.event('customer.subscription.updated',{id:'sub_one'});assert.equal(h.updates.at(-1).active,true);assert.equal(h.updates.at(-1).cancelAtPeriodEnd,true);
  h.subscriptions[0].status='canceled';await h.event('customer.subscription.deleted',{id:'sub_one'});assert.equal(h.updates.at(-1).active,false);assert.equal(h.updates.at(-1).trialUsed,true);
});
test('first paid invoice keeps access and failed-payment invoice follows current subscription status',async t=>{
  const h=harness(t,{subscriptions:[subscription('active')]});await h.event('invoice.paid',{parent:{subscription_details:{subscription:'sub_one'}},amount_paid:4900});assert.equal(h.updates.at(-1).active,true);
  h.subscriptions[0].status='past_due';await h.event('invoice.payment_failed',{subscription:'sub_one'});assert.equal(h.updates.at(-1).active,false);
});
test('completed trial Checkout grants access only after retrieving the actual subscription',async t=>{
  const h=harness(t,{subscriptions:[subscription()]});await h.event('checkout.session.completed',{mode:'subscription',subscription:'sub_one',payment_status:'no_payment_required'});assert.equal(h.updates[0].status,'trialing');assert.equal(h.updates[0].active,true);
});
test('delayed cancellation of an old subscription cannot revoke the current subscription',async t=>{
  const h=harness(t,{profile:{stripeSubscriptionId:'sub_new'},subscriptions:[subscription('canceled'),subscription('active',{id:'sub_new'})]});await h.event('customer.subscription.deleted',{id:'sub_one'});assert.equal(h.updates.length,0);
});
test('events from the wrong Stripe environment never update entitlements',async t=>{const h=harness(t,{subscriptions:[subscription()]});assert.equal((await h.event('customer.subscription.updated',{id:'sub_one'},{livemode:true})).status,500);assert.equal(h.updates.length,0);});
test('other Veyro product webhooks cannot grant or revoke Circle Plus access',async t=>{
  const h=harness(t,{profile:{stripeCustomerId:'cus_one'},subscriptions:[subscription('active',{items:{data:[{price:{id:'price_other',product:'prod_other'}}]}})]});
  assert.equal((await h.event('customer.subscription.updated',{id:'sub_one'})).status,200);assert.equal(h.updates.length,0);
});
test('invalid signatures and non-numeric timestamps never update entitlements',async t=>{
  const h=harness(t);for(const signature of ['t=NaN,v1=invalid','t=1,v1=invalid']){const r=await h.webhook.POST(new Request('https://circle.example.invalid/api/stripe/webhook',{method:'POST',body:'{}',headers:{'stripe-signature':signature}}));assert.ok(r.status>=400);}assert.equal(h.updates.length,0);
});

test('persisting trial and canceled states preserves profile fields and permanent trial history',async t=>{
  const originalFetch=globalThis.fetch;t.after(()=>{globalThis.fetch=originalFetch;});
  // Ephemeral signing material exists only in this test process and is never logged.
  const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const key=privateKey.export({type:'pkcs8',format:'pem'});
  const config={NEXT_PUBLIC_FIREBASE_PROJECT_ID:'demo-circle-billing',FIREBASE_SERVICE_ACCOUNT_EMAIL:'unit@demo.invalid',FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY:key};
  const oldHistory='2026-01-01T00:00:00Z';
  const profile={name:'projects/demo-circle-billing/databases/(default)/documents/users/user-one',updateTime:oldHistory,fields:{name:{stringValue:'Unchanged member'},phone:{stringValue:'unchanged'},circlePlusStartedAt:{timestampValue:oldHistory},circlePlusTrialStartedAt:{timestampValue:oldHistory}}};
  const patches=[];
  globalThis.fetch=async(input,init={})=>{
    const url=new URL(input);
    if(url.hostname==='oauth2.googleapis.com')return Response.json({access_token:'unit-service-token',expires_in:3600});
    assert.equal(url.hostname,'firestore.googleapis.com');
    if(init.method==='PATCH'){
      assert.equal(url.searchParams.get('currentDocument.updateTime'),oldHistory);
      const fields=JSON.parse(init.body).fields;const masks=url.searchParams.getAll('updateMask.fieldPaths');
      assert.deepEqual(masks.sort(),Object.keys(fields).sort());
      for(const protectedField of ['name','email','phone','street','place','circlePlusStartedAt','circlePlusTrialStartedAt'])assert.equal(protectedField in fields,false);
      patches.push(fields);return Response.json({});
    }
    return Response.json(profile);
  };
  const source=readFileSync(new URL('../lib/firebase-server.ts',import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};new Function('require','exports',compiled)(()=>({serverConfig:name=>config[name]}),exports);
  await exports.updateSubscription('user-one',{customerId:'cus_one',subscriptionId:'sub_one',active:true,status:'trialing',trialEnd:'2027-04-18T10:00:00Z',trialUsed:true,cancelAtPeriodEnd:true});
  assert.deepEqual(patches[0].subscriptionPlan,{stringValue:'plus'});assert.deepEqual(patches[0].subscriptionStatus,{stringValue:'trialing'});
  await exports.updateSubscription('user-one',{customerId:'cus_one',subscriptionId:'sub_one',active:false,status:'canceled',trialUsed:true,cancelAtPeriodEnd:false});
  assert.deepEqual(patches[1].subscriptionPlan,{stringValue:'free'});assert.deepEqual(patches[1].subscriptionStatus,{stringValue:'canceled'});
});
