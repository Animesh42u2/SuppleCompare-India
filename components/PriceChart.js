// Plain inline SVG so it ships as static HTML with no chart library.
export default function PriceChart({ series }) {
  if (series.length < 2) {
    return <p className="sub">Price history builds up daily. Check back after a few days.</p>;
  }
  const W = 640, H = 180, P = 28;
  const ys = series.map((s) => s.p);
  const min = Math.min(...ys), max = Math.max(...ys);
  const span = max - min || 1;
  const x = (i) => P + (i * (W - 2 * P)) / (series.length - 1);
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / span;
  const d = series.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s.p).toFixed(1)}`).join(" ");
  const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Price history">
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" />
        <text x={P} y={14} fontSize="11" fill="var(--muted)">{fmt(max)}</text>
        <text x={P} y={H - 8} fontSize="11" fill="var(--muted)">{fmt(min)}</text>
        <text x={W - P} y={H - 8} fontSize="11" fill="var(--muted)" textAnchor="end">
          {series[0].d} to {series[series.length - 1].d}
        </text>
      </svg>
    </div>
  );
}
