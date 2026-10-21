import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const root=fileURLToPath(new URL('..',import.meta.url)),require=createRequire(import.meta.url);
export function createTsLoader(mocks={}){
  const cache=new Map();
  return function load(id,from=path.join(root,'index.ts')){
    if(id in mocks)return mocks[id];
    if(!id.startsWith('@/')&&!id.startsWith('.'))return require(id);
    let file=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(from),id);
    if(!path.extname(file))file+='.ts';
    if(cache.has(file))return cache.get(file);
    if(file.endsWith('.json'))return JSON.parse(readFileSync(file,'utf8'));
    const exports={};cache.set(file,exports);
    const compiled=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
    new Function('require','exports',compiled)(next=>load(next,file),exports);
    return exports;
  };
}
