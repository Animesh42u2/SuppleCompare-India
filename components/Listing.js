import ProductTable from "./ProductTable";
import { CATEGORY_LABELS, affiliateUrl } from "../lib/data";

// Shared by the home, brand and category pages.
export default function Listing({ products, showCategory = true }) {
  if (!products.length) {
    return (
      <p className="empty">
        No prices yet. Run <code>npm run scrape</code> to fetch the first batch.
      </p>
    );
  }
  const rows = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    brand: p.brand,
    storeName: p.storeName,
    storeDomain: new URL(p.url).hostname,
    image: p.image,
    categoryName: CATEGORY_LABELS[p.category] ?? p.category,
    size: p.best.label,
    price: p.best.price,
    pricePerKg: p.best.pricePerKg,
    available: p.best.available,
    buyUrl: affiliateUrl(p.store, p.best.url),
  }));
  return <ProductTable rows={rows} showCategory={showCategory} />;
}
