import "./globals.css";
import Link from "next/link";
import { SITE_NAME, brands, categories, updated } from "../lib/data";

export const metadata = {
  title: { default: `${SITE_NAME} – compare gym supplement prices in India`, template: `%s | ${SITE_NAME}` },
  description:
    "Compare whey protein, creatine, pre-workout and more across Indian stores. Price per kg, daily updated prices and price history.",
};

export default function RootLayout({ children }) {
  const cats = categories();
  return (
    <html lang="en">
      <body>
        <header className="site">
          <div className="wrap">
            <Link href="/" className="logo">{SITE_NAME}</Link>
            <nav>
              {cats.slice(0, 6).map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}/`}>{c.name}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main>
          <div className="wrap">{children}</div>
        </main>
        <footer>
          <div className="wrap">
            <p>
              Prices are collected automatically from each store{updated ? ` (last updated ${updated})` : ""} and may
              differ at checkout. Some links are affiliate links: we may earn a commission at no extra cost to you.
            </p>
            <p>
              Brands: {brands().slice(0, 12).map((b, i) => (
                <span key={b.slug}>{i ? " · " : ""}<Link href={`/brand/${b.slug}/`}>{b.name}</Link></span>
              ))}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
