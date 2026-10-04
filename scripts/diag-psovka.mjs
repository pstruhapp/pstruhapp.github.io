import { writeFileSync, mkdirSync } from "node:fs";
const out = [];
for (let p = 1; p <= 16; p++) {
  const r = await fetch(`https://floodmaps.chmi.cz/hppsoldv/hpps_oplist.php?sort=0&sort_type=asc&startpage=${p}`); const h = await r.text();
  for (const row of h.split(/<tr[\s>]/i).slice(1)) { const t = row.replace(/<[^>]+>/g, "|").replace(/\s+/g, " "); if (/Pšov|Psov|Mělník|Melnik|Kokoř|Obříst|Liběch|Vraňan|Želíz/i.test(t)) out.push(p + " " + t.slice(0, 300)); }
}
const extra = [];
for (const u of ["https://www.pla.cz/portal/sap/cz/PC/Mereni.aspx?id=0&oid=1", "https://www.pla.cz/planet/public/vodnistavy/"]) { try { const h = await (await fetch(u)).text(); extra.push(u + " " + (h.match(/.{0,200}Pšov.{0,200}/gi) || []).join(" || ")); } catch (e) { extra.push(u + " ERR " + e.message); } }
mkdirSync("staging", { recursive: true }); writeFileSync("staging/psovka.txt", out.join("\n") + "\n---\n" + extra.join("\n"));
