import Link from "next/link";
import { notFound } from "next/navigation";
import PriceChart from "../../../components/PriceChart";
import {
  CATEGORY_LABELS, affiliateUrl, allProducts, getHistory, getProduct, inr,
} from "../../../lib/data";

export function generateStaticParams() {
  const list = allProducts().map((p) => ({ slug: p.slug }));
  return list.length ? list : [{ slug: "none" }];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.title} price in India`,
    description: `${p.title} by ${p.brand}: current price ${inr(p.best.price)}${
      p.best.pricePerKg ? ` (${inr(p.best.pricePerKg)}/kg)` : ""
    } at ${p.storeName}, with price history.`,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const catName = CATEGORY_LABELS[p.category] ?? p.category;
  const similar = allProducts()
    .filter((o) => o.category === p.category && o.slug !== p.slug && o.best.pricePerKg)
    .sort((a, b) => a.best.pricePerKg - b.best.pricePerKg)
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    brand: { "@type": "Brand", name: p.brand },
    image: p.image ?? undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...p.variants.map((v) => v.price)),
      highPrice: Math.max(...p.variants.map((v) => v.price)),
      offerCount: p.variants.length,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="sub">
        <Link href="/">Home</Link> / <Link href={`/category/${p.category}/`}>{catName}</Link> /{" "}
        <Link href={`/brand/${p.brandSlug}/`}>{p.brand}</Link>
      </p>
      <div className="hero">
        {p.image && <img src={p.image} alt={p.title} />}
        <div>
          <h1>{p.title}</h1>
          <p className="sub">Sold by {p.storeName}</p>
        </div>
      </div>

      <h2>Sizes and prices</h2>
      <div className="tablewrap">
        <table className="variants">
          <thead>
            <tr><th>Size</th><th className="num">Price</th><th className="num">MRP</th><th className="num">Per kg</th><th></th></tr>
          </thead>
          <tbody>
            {p.variants.map((v) => (
              <tr key={v.url}>
                <td>{v.label}</td>
                <td className="num">{inr(v.price)}</td>
                <td className="num">{v.compareAt && v.compareAt > v.price ? inr(v.compareAt) : "–"}</td>
                <td className="num">{inr(v.pricePerKg)}</td>
                <td>
                  {v.available ? (
                    <a className="btn" href={affiliateUrl(p.store, v.url)} target="_blank" rel="sponsored noopener nofollow">
                      Buy at {p.storeName}
                    </a>
                  ) : (
                    <span className="pill oos">Out of stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Price history</h2>
      <PriceChart series={getHistory(p.id)} />

      {similar.length > 0 && (
        <>
          <h2>Cheapest {catName} per kg</h2>
          <div className="tablewrap">
            <table className="variants">
              <tbody>
                {similar.map((o) => (
                  <tr key={o.slug}>
                    <td className="name"><Link href={`/product/${o.slug}/`}>{o.title}</Link><span className="brand">{o.brand}</span></td>
                    <td className="num">{inr(o.best.pricePerKg)}/kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
