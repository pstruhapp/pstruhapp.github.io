import { writeFileSync, mkdirSync } from "node:fs";
const names = ["pstruhakapr","pstruh-kapr","pstruhapp","kaprapp","revirnik","mujrevir","kdechytat","nejblizsirevir","rybarskaapka","rybarskaaplikace","rybarskeapky","rybarskypartak","revirynamobilu","chytamto","pstruhkapr","pstruhaapka","revirapp"];
const out = [];
for (const n of names) {
  const d = n + ".cz";
  try { const r = await fetch("https://rdap.nic.cz/domain/" + d, { headers: { accept: "application/rdap+json" } });
    let info = ""; if (r.status === 200) { const j = await r.json(); info = (j.events || []).map((e) => e.eventAction + ":" + (e.eventDate || "").slice(0, 10)).join(" "); }
    out.push(`${d}\t${r.status === 404 ? "VOLNÁ" : r.status === 200 ? "obsazená" : "status " + r.status}\t${info}`);
  } catch (e) { out.push(`${d}\tERR ${e.message}`); }
  await new Promise((q) => setTimeout(q, 600));
}
mkdirSync("staging", { recursive: true }); writeFileSync("staging/domeny.txt", out.join("\n"));
