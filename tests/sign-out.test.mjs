import test from 'node:test';
import assert from 'node:assert/strict';
import {createTsLoader} from './load-typescript.mjs';
const {signOutWithCleanup}=createTsLoader()('@/lib/sign-out');

test('push cleanup failures cannot prevent ending the login session',async()=>{
 let ended=false;
 await signOutWithCleanup(async()=>{throw Error('Push unsubscribe failed');},async()=>{ended=true;});
 assert.equal(ended,true);
});

test('failed authentication sign-out is reported instead of claiming success',async()=>{
 for(const cleanup of [async()=>{},async()=>{throw Error('Push failed');}]){
  await assert.rejects(signOutWithCleanup(cleanup,async()=>{throw Error('Session could not be ended');}),/Session could not be ended/);
 }
});
