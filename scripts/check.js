// Validates every set file and reports likely duplicate questions across sets.
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "..", "sets");
const want = { anc: 30, med: 30, mod: 30, civ: 40 };
const banned = /उपर्युक्त सभी|इनमें से कोई नहीं|उपरोक्त सभी|सभी उपर्युक्त/;
const all = [];
for (let n = 1; n <= 15; n++) {
  const f = path.join(dir, `set${String(n).padStart(2, "0")}.json`);
  if (!fs.existsSync(f)) { console.log(`set${n}: MISSING`); continue; }
  let D; try { D = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.log(`set${n}: BAD JSON ${e.message}`); continue; }
  const errs = [];
  for (const [k, c] of Object.entries(want)) {
    const arr = D[k] || [];
    if (arr.length !== c) errs.push(`${k}=${arr.length}`);
    arr.forEach((r, i) => {
      if (!Array.isArray(r) || r.length !== 6 || r.some(x => typeof x !== "string" || !x.trim())) errs.push(`${k}[${i}] shape`);
      else {
        if (new Set(r.slice(1, 5).map(s => s.trim())).size !== 4) errs.push(`${k}[${i}] dup options`);
        if (r.slice(1, 5).some(o => banned.test(o))) errs.push(`${k}[${i}] banned option`);
        all.push({ n, k, i, q: r[0], a: r[1] });
      }
    });
  }
  console.log(`set${n}: ${errs.length ? errs.join("; ") : "ok"}`);
}
// near-duplicate detection: same correct answer + high word overlap in question
const norm = s => s.replace(/[^ऀ-ॿ\w\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
const dups = [];
for (let x = 0; x < all.length; x++) for (let y = x + 1; y < all.length; y++) {
  const A = all[x], B = all[y];
  if (A.a.trim() !== B.a.trim()) continue;
  const wa = new Set(norm(A.q)), wb = new Set(norm(B.q));
  const inter = [...wa].filter(w => wb.has(w)).length;
  const j = inter / Math.max(1, Math.min(wa.size, wb.size));
  if (j >= 0.5) dups.push(`${A.n}.${A.k}[${A.i}] ~ ${B.n}.${B.k}[${B.i}] | ${A.a} | ${A.q.slice(0, 60)} || ${B.q.slice(0, 60)}`);
}
console.log(`\nlikely duplicates: ${dups.length}`);
if (process.argv[2] === "-v") dups.forEach(d => console.log(d));
