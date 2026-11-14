import Link from "next/link";
import Listing from "../../../components/Listing";
import { allProducts, brands } from "../../../lib/data";

export function generateStaticParams() {
  const list = brands().map((b) => ({ brand: b.slug }));
  return list.length ? list : [{ brand: "none" }];
}

export async function generateMetadata({ params }) {
  const { brand } = await params;
  const name = brands().find((b) => b.slug === brand)?.name ?? brand;
  return {
    title: `${name} supplement prices in India`,
    description: `Current prices for every ${name} supplement, with price per kg and price history.`,
  };
}

export default async function BrandPage({ params }) {
  const { brand } = await params;
  const products = allProducts().filter((p) => p.brandSlug === brand);
  const name = products[0]?.brand ?? brand;
  return (
    <>
      <p className="sub"><Link href="/">Home</Link> / {name}</p>
      <h1>{name} prices in India</h1>
      <p className="sub">{products.length} products</p>
      <Listing products={products} />
    </>
  );
}
