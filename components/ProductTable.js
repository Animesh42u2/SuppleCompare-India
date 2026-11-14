"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

const inr = (n) => (n == null ? "–" : "₹" + Math.round(n).toLocaleString("en-IN"));

// rows: [{ slug, title, brand, storeName, storeDomain, image, categoryName, size, price, pricePerKg, available, buyUrl }]
export default function ProductTable({ rows, showCategory = true }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("perkg");

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = term
      ? rows.filter((r) => `${r.title} ${r.brand}`.toLowerCase().includes(term))
      : rows;
    const key = {
      perkg: (r) => r.pricePerKg ?? Infinity,
      price: (r) => r.price,
      name: (r) => r.title.toLowerCase(),
    }[sort];
    return [...filtered].sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0));
  }, [rows, q, sort]);

  return (
    <>
      <div className="tools">
        <input placeholder="Search product or brand" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="perkg">Cheapest per kg</option>
          <option value="price">Lowest price</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      <div className="tablewrap">
        <table className="responsive">
          <thead>
            <tr>
              <th className="c-prod">Product</th>
              {showCategory && <th className="c-cat hide-md">Category</th>}
              <th className="c-store">Store</th>
              <th className="c-size">Size</th>
              <th className="c-num num">Price</th>
              <th className="c-num num">Per kg</th>
              <th className="c-act"></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.slug}>
                <td className="name">
                  <div className="prod">
                    {r.image ? (
                      <img className="thumb" src={r.image} alt="" width="48" height="48" loading="lazy" />
                    ) : (
                      <span className="thumb" />
                    )}
                    <div>
                      <Link href={`/product/${r.slug}/`}>{r.title}</Link>
                      <span className="brand">{r.brand}</span>
                    </div>
                  </div>
                </td>
                {showCategory && (
                  <td className="hide-md" data-label="Category">{r.categoryName}</td>
                )}
                <td data-label="Store">
                  <span className="store">
                    <img
                      className="store-logo"
                      src={`https://www.google.com/s2/favicons?domain=${r.storeDomain}&sz=64`}
                      alt=""
                      width="20"
                      height="20"
                      loading="lazy"
                    />
                    {r.storeName}
                  </span>
                </td>
                <td data-label="Size">{r.size}</td>
                <td className="num" data-label="Price">{inr(r.price)}</td>
                <td className="num" data-label="Per kg">{inr(r.pricePerKg)}</td>
                <td className="action">
                  {r.available ? (
                    <a className="btn" href={r.buyUrl} target="_blank" rel="sponsored noopener nofollow">Buy</a>
                  ) : (
                    <span className="pill oos">Out of stock</span>
                  )}
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr><td colSpan={7} className="name" style={{ textAlign: "center", color: "var(--muted)" }}>No matches</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}