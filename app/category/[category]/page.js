import Link from "next/link";
import Listing from "../../../components/Listing";
import { CATEGORY_LABELS, allProducts, categories } from "../../../lib/data";

export function generateStaticParams() {
  const list = categories().map((c) => ({ category: c.slug }));
  // Static export needs at least one param even before the first scrape.
  return list.length ? list : [{ category: "whey-protein" }];
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const name = CATEGORY_LABELS[category] ?? category;
  return {
    title: `Best ${name} in India – price comparison`,
    description: `Compare ${name} prices across Indian stores, sorted by price per kg, updated daily.`,
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const name = CATEGORY_LABELS[category] ?? category;
  const products = allProducts().filter((p) => p.category === category);
  return (
    <>
      <p className="sub"><Link href="/">Home</Link> / {name}</p>
      <h1>Best {name} in India</h1>
      <p className="sub">{products.length} products compared by price per kg</p>
      <Listing products={products} showCategory={false} />
    </>
  );
}
