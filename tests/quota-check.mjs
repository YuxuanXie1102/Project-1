import assert from 'node:assert/strict';
import ts from 'typescript';
import {mkdir,rm,readFile,writeFile} from 'node:fs/promises';
await mkdir('.sites-runtime/verify',{recursive:true});
for(const name of ['dining','dining-api']){const code=await readFile('lib/'+name+'.ts','utf8');const compiled=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("from './dining'","from './dining.mjs'");await writeFile('.sites-runtime/verify/'+(name==='dining-api'?'api':name)+'.mjs',compiled);}
const {diningAPI}=await import('../.sites-runtime/verify/api.mjs');
const {aggregate,randomPick}=await import('../.sites-runtime/verify/dining.mjs');
let calls=0;let lastURL;globalThis.fetch=async(url,options)=>{calls++;lastURL=new URL(url);assert.equal(options.headers['x-api-key'],'test-key');return Response.json({status:'OK',data:Array.from({length:8},(_,i)=>({business_id:String(i),name:'Restaurant '+i,latitude:43.5,longitude:-79.6}))})};
const request=(query)=>new Request('https://example.com/api/restaurants?'+query);
let response=await diningAPI(request('query=restaurants'),{OPENWEBNINJA_API_KEY:'test-key'});assert.equal(response.status,400);assert.equal(calls,0);
response=await diningAPI(request('query=restaurants&confirmed=yes'),{});assert.equal(response.status,503);assert.equal(calls,0);
const [one,two]=await Promise.all([diningAPI(request('query=restaurants&confirmed=yes&limit=100'),{OPENWEBNINJA_API_KEY:'test-key'}),diningAPI(request('query=restaurants&confirmed=yes'),{OPENWEBNINJA_API_KEY:'test-key'})]);assert.equal(calls,1);assert.equal(lastURL.searchParams.get('limit'),'5');assert.equal((await one.json()).restaurants.length,5);assert.equal((await two.json()).restaurants.length,5);
response=await diningAPI(request('query=restaurants&confirmed=yes'),{OPENWEBNINJA_API_KEY:'test-key'});assert.equal((await response.json()).cached,true);assert.equal(calls,1);
assert.equal(aggregate([{cuisines:['Italian'],budget:30},{cuisines:['Italian','Thai'],budget:20}]).budget,20);assert.deepEqual(aggregate([{cuisines:['Italian'],budget:30},{cuisines:['Italian','Thai'],budget:20}]).votes,[['Italian',2],['Thai',1]]);
assert.equal(randomPick([]),undefined);for(let i=0;i<100;i++)assert.ok(['a','b'].includes(randomPick(['a','b'])));
await rm('.sites-runtime/verify',{recursive:true,force:true});
console.log('PASS: confirmation guard, missing-key guard, forced limit=5, capped response, in-flight deduplication, cached search, group aggregation, shortlist-only random selection. No external requests made.');
