// Copies finished set files from another folder into ../sets (used while question sets are being generated).
// Usage: node scripts/import-sets.js <source-folder>
const fs=require("fs"),path=require("path");
const from=process.argv[2];if(!from){console.log("usage: node scripts/import-sets.js <folder>");process.exit(1);}
const to=path.join(__dirname,"..","sets");let n=0;
for(const f of fs.readdirSync(from))if(/^set\d\d\.json$/.test(f)){
  try{JSON.parse(fs.readFileSync(path.join(from,f),"utf8"));fs.copyFileSync(path.join(from,f),path.join(to,f));n++;}catch(e){console.log("skip (bad json):",f);}
}
console.log(`imported ${n} file(s)`);
