// Fetches every product from each Shopify store, normalises sizes and
// prices, writes data/products.json and appends today's prices to data/history.json.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stores = JSON.parse(await readFile(path.join(root, "scripts/stores.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);

const CATEGORIES = [
  ["whey-protein", /whey|isolate|protein powder|gold standard/i],
  ["plant-protein", /plant|vegan|pea protein/i],
  ["creatine", /creatine/i],
  ["pre-workout", /pre[- ]?workout|pre-?workout/i],
  ["mass-gainer", /mass gainer|weight gainer|gainer/i],
  ["bcaa-eaa", /bcaa|eaa|amino/i],
  ["protein-bar", /bar\b|bars\b/i],
  ["peanut-butter", /peanut butter/i],
];

function categorise(p) {
  const hay = `${p.title} ${p.product_type} ${(p.tags || []).join(" ")}`;
  for (const [slug, re] of CATEGORIES) if (re.test(hay)) return slug;
  return "other";
}

// "1 kg", "2.2 lb", "500g", "4.4 lbs" -> kilograms, or null if not a weight
function parseKg(text) {
  if (!text) return null;
  const m = String(text).toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|kgs|g|gm|gms|lb|lbs)\b/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  switch (m[2]) {
    case "kg": case "kgs": return n;
    case "lb": case "lbs": return n * 0.45359237;
    default: return n / 1000;
  }
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function fetchAll(domain) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`https://${domain}/products.json?limit=250&page=${page}`, {
      headers: { "user-agent": "supplement-price-bot/0.1 (price comparison)" },
    });
    if (!res.ok) throw new Error(`${domain} responded ${res.status}`);
    const { products } = await res.json();
    if (!products?.length) break;
    out.push(...products);
    if (products.length < 250) break;
  }
  return out;
}

const products = [];
const failures = [];

for (const store of stores) {
  try {
    const raw = await fetchAll(store.domain);
    const seen = new Set();
    for (const p of raw) {
      if (seen.has(p.handle)) continue; // stores sometimes repeat a product across pages
      seen.add(p.handle);
      const productKg = parseKg(p.title);
      const variants = p.variants
        .map((v) => {
          const kg = parseKg(v.title) ?? parseKg(v.option1) ?? (v.grams ? v.grams / 1000 : null) ?? productKg;
          const price = parseFloat(v.price);
          if (!price) return null;
          return {
            label: v.title === "Default Title" ? (kg ? `${+kg.toFixed(3)} kg` : "Standard") : v.title,
            kg: kg ? +kg.toFixed(3) : null,
            price,
            compareAt: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
            pricePerKg: kg ? Math.round(price / kg) : null,
            available: !!v.available,
            url: `https://${store.domain}/products/${p.handle}?variant=${v.id}`,
          };
        })
        .filter(Boolean);
      if (!variants.length) continue;
      products.push({
        id: `${store.id}__${p.handle}`,
        slug: slugify(`${store.id}-${p.handle}`),
        store: store.id,
        storeName: store.name,
        brand: p.vendor || store.name,
        brandSlug: slugify(p.vendor || store.name),
        title: p.title,
        category: categorise(p),
        image: p.images?.[0]?.src ?? null,
        url: `https://${store.domain}/products/${p.handle}`,
        variants,
      });
    }
    console.log(`${store.name}: ${raw.length} products`);
  } catch (err) {
    failures.push(store.id);
    console.error(`FAILED ${store.name}: ${err.message}`);
  }
}

// A store that failed keeps yesterday's data instead of disappearing from the site.
let previous = [];
try { previous = JSON.parse(await readFile(path.join(root, "data/products.json"), "utf8")).products; } catch {}
const kept = previous.filter((p) => failures.includes(p.store));
const merged = [...products, ...kept];

if (!merged.length) {
  console.error("No products fetched from any store; leaving data files untouched.");
  process.exit(1);
}

await writeFile(
  path.join(root, "data/products.json"),
  JSON.stringify({ updated: today, products: merged }, null, 1)
);

let history = {};
try { history = JSON.parse(await readFile(path.join(root, "data/history.json"), "utf8")); } catch {}
for (const p of products) {
  const best = p.variants.filter((v) => v.pricePerKg).sort((a, b) => a.pricePerKg - b.pricePerKg)[0] ?? p.variants[0];
  const series = (history[p.id] ??= []);
  const last = series[series.length - 1];
  if (last?.d === today) series.pop();
  series.push({ d: today, p: best.price, k: best.pricePerKg });
}
await writeFile(path.join(root, "data/history.json"), JSON.stringify(history));

console.log(`Wrote ${merged.length} products (${failures.length} stores failed).`);
if (failures.length === stores.length) process.exit(1);
