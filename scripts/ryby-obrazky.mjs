// Jednorázově: stáhne kandidátní obrázky ryb z Wikimedia Commons (volná licence) do staging/ryby/.
import { mkdirSync, writeFileSync } from "node:fs";
const UA = { "User-Agent": "PstruhApp/1.0 (https://pstruhapp.github.io; ryby obrazky)" };
const C = {"Salmo trutta":["Salmo trutta.jpg","Bachforelle Zeichnung.jpg"],"Oncorhynchus mykiss":["Trout.jpg","Oncorhynchus mykiss.jpg","Rainbow trout transparent.png"],"Salvelinus fontinalis":["Salvelinus fontinalis.jpg","Brook Trout Salvelinus fontinalis 2900px.jpg"],"Thymallus thymallus":["Grayling Thymallus thymallus.JPG","Harjus.JPG","Thymallus thymallus.jpg"],"Hucho hucho":["Donaulax.jpg","Danube Salmon - Huchen (Hucho hucho).jpg"],"Salmo salar":["Atlantischer Lachs.jpg","Atlantic salmon fish.jpg"],"Coregonus maraena":["Coregonus lavaretus maraena 1.jpg","Coregonus lavaretus.jpg"],"Cyprinus carpio":["Cyprinus carpio3.jpg","Cyprinus carpio 2008 G1.jpg","Mirror carp 2008 G1.jpg"],"Ctenopharyngodon idella":["Grass-Carp1web.jpg","Grass carp portrait.jpg"],"Hypophthalmichthys molitrix":["Silver Carp Adult (Hypophthalmichthys molitrix).jpg"],"Hypophthalmichthys nobilis":["Bighead carp.gif","Bighead carp b.gif"],"Tinca tinca":["Tinca tinca1.jpg","Tinca tinca Prague Vltava 2.jpg"],"Carassius carassius":["Carassius carassius1.jpg"],"Carassius gibelio":["Carassius gibelio 2008 G1.jpg"],"Abramis brama":["Carp bream.jpg"],"Blicca bjoerkna":["SilverBreamBliccaBjoerknaCropped.JPG"],"Rutilus rutilus":["Rutilus rutilus5.jpg","Rutilus rutilus by Algirdas cropped.jpg"],"Scardinius erythrophthalmus":["Scardinius erythrophthalmus2.jpg","Scardinius erythropthalmus 2009 G1.jpg"],"Alburnus alburnus":["AlburnusAlburnus1.JPG"],"Squalius cephalus":["Squalius cephalus1.jpg","Oniria - Squalius cephalus 03.jpg"],"Leuciscus idus":["Leuciscus idus.jpg"],"Leuciscus leuciscus":["Leuciscus leuciscus1.jpg"],"Leuciscus aspius":["Aspius aspius Prague Vltava 1 (cropped).jpg"],"Barbus barbus":["Barbus barbus1.jpg","Barbel.jpg"],"Vimba vimba":["Vimba vimba1.jpg"],"Chondrostoma nasus":["Chondrostoma nasus.jpg"],"Gobio gobio":["Riviergrondel.jpg"],"Esox lucius":["Esox lucius2.jpg"],"Sander lucioperca":["Sander lucioperca 2.jpg","Sander lucioperca.jpg"],"Perca fluviatilis":["Perca fluviatilis1.jpg","Perca fluviatilis 2008 G1.jpg"],"Gymnocephalus cernua":["Gymnocephalus cernuus Pärnu River Estonia 2010-01-06.jpg"],"Silurus glanis":["Silurus glanis1.jpg"],"Ameiurus nebulosus":["Ameiurus nebulosus.jpg","Ictalurus nebulosus GLERL 1.jpg"],"Anguilla anguilla":["Anguilla anguilla1.jpg"],"Lota lota":["Lota lota.jpg","Trüsche Walchensee.jpg"],"Acipenser ruthenus":["Acipenser ruthenus1.jpg"],"Lepomis gibbosus":["Lepomis gibbosus PAQ.jpg"],"Pseudorasbora parva":["Pseudorasbora parva(edited version).jpg"],"Perccottus glenii":["Percottus glenii 2009 G1.jpg"],"Cottus gobio":["Cottus gobio.jpg"],"Misgurnus fossilis":["Misgurnus fossilis1.jpg"]};
const out = {}; mkdirSync("staging/ryby", { recursive: true });
for (const [la, files] of Object.entries(C)) {
  out[la] = [];
  const j = await (await fetch(`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=640&format=json&titles=${encodeURIComponent(files.map((f) => "File:" + f).join("|"))}`, { headers: UA })).json();
  const pages = Object.values(j.query.pages);
  let i = 0;
  for (const f of files) {
    const p = pages.find((x) => x.title.replace(/_/g, " ").toLowerCase() === ("File:" + f).toLowerCase());
    if (!p || !p.imageinfo) { out[la].push({ f, chyba: "nenalezeno" }); continue; }
    const ii = p.imageinfo[0], m = ii.extmetadata || {};
    const name = la.toLowerCase().replace(/ /g, "-") + "-" + (++i) + (ii.thumburl.match(/\.(png|gif|jpe?g)(\?|$)/i)?.[0].replace("?", "") || ".jpg");
    try { const r = await fetch(ii.thumburl, { headers: UA }); writeFileSync("staging/ryby/" + name, Buffer.from(await r.arrayBuffer())); } catch (e) { out[la].push({ f, chyba: String(e) }); continue; }
    out[la].push({ f, soubor: name, autor: (m.Artist?.value || "").replace(/<[^>]+>/g, "").trim(), licence: m.LicenseShortName?.value || "", url: ii.descriptionurl });
    await new Promise((r) => setTimeout(r, 300));
  }
}
writeFileSync("staging/ryby/kandidati.json", JSON.stringify(out, null, 1));
console.log("hotovo");
