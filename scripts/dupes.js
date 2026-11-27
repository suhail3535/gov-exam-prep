// Lists repeat questions: for each cluster of same-fact questions, keeps the earliest and lists the rest for replacement.
const fs=require("fs"),path=require("path");
const dir=path.join(__dirname,"..","sets");const keys=["anc","med","mod","civ"];
const all=[];
for(let n=1;n<=15;n++){const D=JSON.parse(fs.readFileSync(path.join(dir,`set${String(n).padStart(2,"0")}.json`),"utf8"));
  keys.forEach(k=>D[k].forEach((r,i)=>all.push({n,k,i,q:r[0],a:r[1].trim()})));}
const generic=/केवल|दोनों|न तो|^[\d,\s\-–]+$|[A-D]\s*[-–]\s*\d|\(A\)|\(R\)|सत्य|असत्य|सही है/;
const stop=new Set("किस किसने किसके किसकी कौन कौन-सा कौन-सी कौनसा निम्नलिखित में से था थी थे है हैं की के का को ने और भी एक यह वह इस उस द्वारा लिए गया गयी गई किया कहाँ कहा जाता जाती सबसे प्रथम पहला पहली ई. सन्".split(" "));
const norm=s=>s.replace(/[^\u0900-\u097F\w\s]/g," ").split(/\s+/).filter(w=>w.length>1&&!stop.has(w));
const seen=[];const repl={};let count=0;
for(const x of all){
  if(generic.test(x.a)){continue;}
  const wx=new Set(norm(x.q));
  const hit=seen.find(y=>{if(y.a!==x.a)return false;const wy=y.w;const inter=[...wx].filter(w=>wy.has(w)).length;return inter/Math.max(1,Math.min(wx.size,wy.size))>=0.5;});
  if(hit&&hit.n!==x.n){(repl[x.n]=repl[x.n]||[]).push({k:x.k,i:x.i,q:x.q,a:x.a,first:`set${hit.n}`});count++;}
  else seen.push({...x,w:wx});
}
console.log("to replace:",count);for(const n in repl)console.log(`set${n}: ${repl[n].length}`);
fs.writeFileSync(process.argv[2]||path.join(require("os").tmpdir(),"dupes.json"),JSON.stringify(repl,null,1));
