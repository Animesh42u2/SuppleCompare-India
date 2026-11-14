# SuppleCompare India

Gym supplement price comparison. Next.js, statically exported, so hosting is free.

## Run it

```
npm install
npm run scrape   # fetches prices into data/products.json and data/history.json
npm run dev      # http://localhost:3000
npm run build    # static site in ./out
```

## How it works

- `scripts/stores.json` lists the stores. Shopify stores are read from `/products.json`.
- `scripts/scrape.mjs` normalises sizes to kg, computes price per kg, appends today's
  price to `data/history.json`. If a store fails, its previous data is kept.
- `lib/data.js` reads the data files; pages are generated for every product
  (`/product/...`), brand (`/brand/...`) and category (`/category/...`).
- `data/affiliate.json` holds your affiliate tag per store (`none` until you have one).
- `.github/workflows/daily-prices.yml` scrapes daily and commits the data. Connect the
  repo to Vercel or Cloudflare Pages (build command `npm run build`, output `out`) and
  every commit rebuilds the site.

## Adding a store

Shopify: add an entry to `scripts/stores.json` and an entry to `data/affiliate.json`.
Non-Shopify stores (MuscleBlaze, Avvatar, The Whole Truth, Fuaark, Yoga Bar,
Only What's Needed) need their own fetch function in `scrape.mjs`.
