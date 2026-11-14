import Link from "next/link";
import Listing from "../components/Listing";
import { allProducts, brands, categories, updated } from "../lib/data";

export default function Home() {
  const products = allProducts();
  return (
    <>
      <h1>Compare gym supplement prices in India</h1>
      <p className="sub">
        {products.length} products across Indian stores, ranked by price per kg
        {updated ? ` · updated ${updated}` : ""}
      </p>
      <div className="chips">
        {categories().map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}/`}>{c.name} ({c.count})</Link>
        ))}
      </div>
      <Listing products={products} />
      <h2>Browse by brand</h2>
      <div className="chips">
        {brands().map((b) => (
          <Link key={b.slug} href={`/brand/${b.slug}/`}>{b.name} ({b.count})</Link>
        ))}
      </div>
    </>
  );
}
