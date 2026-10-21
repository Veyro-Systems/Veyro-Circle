// Append Norway while preserving every existing country/postcode ID (array index).
// Usage: node scripts/add-norway-postcodes.mjs /absolute/path/to/NO.txt
import {readFileSync,writeFileSync} from 'node:fs';
const input=process.argv[2];
if(!input)throw Error('Provide the extracted GeoNames NO.txt export');
const path=new URL('../data/postal-places.json',import.meta.url);
const original=JSON.parse(readFileSync(path,'utf8'));
if(original.some(row=>row[0]==='NO'))throw Error('Norway already exists; refusing to replace or reindex locations');
const seen=new Set();
const added=[];
for(const line of readFileSync(input,'utf8').trim().split('\n')){
  const f=line.split('\t'),lat=Number(f[9]),lon=Number(f[10]);
  if(f[0]!=='NO'||!/^\d{4}$/.test(f[1])||!f[2]||!f[9]||!f[10]||!Number.isFinite(lat)||!Number.isFinite(lon))continue;
  const key=f.slice(0,3).join(':');if(seen.has(key))continue;seen.add(key);
  added.push([f[0],f[1],f[2],lat,lon]);
}
if(added.length<1000)throw Error('Incomplete Norway export');
writeFileSync(path,JSON.stringify([...original,...added]));
console.log(JSON.stringify({existingLocationsPreserved:original.length,norwegianLocationsAdded:added.length,firstNorwegianId:String(original.length)}));
