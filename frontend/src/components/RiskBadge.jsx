export default function RiskBadge({ category }) {
  const cls = {
    Low: "badge badge-low",
    Watchlist: "badge badge-watchlist",
    "High Risk": "badge badge-high",
    Critical: "badge badge-critical",
  }[category] || "badge";
  return <span className={cls}>{category}</span>;
}
