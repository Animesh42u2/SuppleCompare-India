import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

function readJson(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));
  } catch {
    return fallback;
  }
}

const affiliate = readJson("affiliate.json", {});
const rawCatalog = readJson("products.json", { updated: null, products: [] });
// Keep one entry per slug, so React keys and static page paths never collide.
const catalog = {
  ...rawCatalog,
  products: [...new Map(rawCatalog.products.map((p) => [p.slug, p])).values()],
};
const history = readJson("history.json", {});

export const SITE_NAME = "SuppleCompare India";
export const updated = catalog.updated;

export const CATEGORY_LABELS = {
  "whey-protein": "Whey Protein",
  "plant-protein": "Plant Protein",
  creatine: "Creatine",
  "pre-workout": "Pre-Workout",
  "mass-gainer": "Mass Gainers",
  "bcaa-eaa": "BCAA & EAA",
  "protein-bar": "Protein Bars",
  "peanut-butter": "Peanut Butter",
  other: "Other Supplements",
};

// Link to a store, with the store's affiliate tag if one is configured.
export function affiliateUrl(storeId, url) {
  const cfg = affiliate[storeId];
  if (!cfg || cfg.mode === "none" || !cfg.value) return url;
  if (cfg.mode === "param") return url + (url.includes("?") ? "&" : "?") + cfg.value;
  if (cfg.mode === "prefix") return cfg.value.replace("{url}", encodeURIComponent(url));
  return url;
}

export function bestVariant(p) {
  const priced = p.variants.filter((v) => v.pricePerKg);
  const pool = priced.length ? priced : p.variants;
  const inStock = pool.filter((v) => v.available);
  const use = inStock.length ? inStock : pool;
  return [...use].sort((a, b) => (a.pricePerKg ?? a.price) - (b.pricePerKg ?? b.price))[0];
}

export function allProducts() {
  return catalog.products.map((p) => ({ ...p, best: bestVariant(p) }));
}

export const getProduct = (slug) => allProducts().find((p) => p.slug === slug);
export const getHistory = (id) => history[id] ?? [];

export function brands() {
  const map = new Map();
  for (const p of allProducts()) {
    const b = map.get(p.brandSlug) ?? { slug: p.brandSlug, name: p.brand, count: 0 };
    b.count++;
    map.set(p.brandSlug, b);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function categories() {
  const map = new Map();
  for (const p of allProducts()) map.set(p.category, (map.get(p.category) ?? 0) + 1);
  return [...map].map(([slug, count]) => ({ slug, name: CATEGORY_LABELS[slug] ?? slug, count }));
}

export const inr = (n) => (n == null ? "–" : "₹" + Math.round(n).toLocaleString("en-IN"));
