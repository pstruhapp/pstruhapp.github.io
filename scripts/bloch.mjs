// Jednorázově: stáhne tabule z Blochovy Ichtyologie (Wikimedia Commons, volné dílo) do větve staging-ryby.
import { mkdirSync, writeFileSync } from "node:fs";
const UA = { "User-Agent": "PstruhApp/1.0 (https://pstruhapp.github.io; bloch plates)" };
const api = async (q) => (await fetch("https://commons.wikimedia.org/w/api.php?format=json&" + q, { headers: UA })).json();
let titles = [], off = 0;
for (let k = 0; k < 6; k++) {
  const j = await api(`action=query&list=search&srnamespace=6&srlimit=500&sroffset=${off}&srsearch=${encodeURIComponent('intitle:"Ichtyologie, ou, Histoire naturelle, générale et particulière des poissons (Pl."')}`);
  titles.push(...j.query.search.map((x) => x.title)); if (!j.continue) break; off = j.continue.sroffset;
}
const extra = (process.env.EXTRA || "").split("|").filter(Boolean);
titles.push(...extra.map((t) => "File:" + t));
mkdirSync("staging/bloch", { recursive: true });
const meta = {};
for (let i = 0; i < titles.length; i += 20) {
  const j = await api(`action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400&titles=${encodeURIComponent(titles.slice(i, i + 20).join("|"))}`);
  for (const p of Object.values(j.query.pages)) {
    if (!p.imageinfo) continue; const ii = p.imageinfo[0];
    const m = p.title.match(/\(Pl\. ([IVXLC]+)\)/); const name = m ? "pl-" + m[1] + (/white/.test(p.title) ? "-w" : "") : p.title.replace(/^File:/, "").replace(/[^A-Za-z0-9]+/g, "-").slice(0, 60);
    const r = await fetch(ii.thumburl, { headers: UA }); writeFileSync(`staging/bloch/${name}.jpg`, Buffer.from(await r.arrayBuffer()));
    meta[name] = { title: p.title, url: ii.descriptionurl, autor: (ii.extmetadata?.Artist?.value || "").replace(/<[^>]+>/g, "").trim(), licence: ii.extmetadata?.LicenseShortName?.value || "" };
    await new Promise((r) => setTimeout(r, 200));
  }
}
writeFileSync("staging/bloch/meta.json", JSON.stringify(meta, null, 1));
console.log(Object.keys(meta).length);
