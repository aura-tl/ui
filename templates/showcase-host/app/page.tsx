const apps = [
  ["scores", "Scores", "Follow today’s live games and open a focused matchup."],
  [
    "sportsbook",
    "Against the house",
    "Live consensus markets and a local selection slip.",
  ],
  [
    "props",
    "Prop research",
    "Search retained player lines and build a research card.",
  ],
  [
    "arbitrage",
    "Arbitrage watch",
    "Measure consensus pricing and flag honest anomalies.",
  ],
  [
    "model",
    "Model lab",
    "Turn retained projections into a configurable thesis.",
  ],
  [
    "fantasy-draft",
    "Fantasy draft",
    "Draft with consensus order and recomputable scoring.",
  ],
  [
    "dfs-lineup",
    "DFS lineup",
    "Build a projected lineup without invented salaries.",
  ],
];
export default function Page() {
  return (
    <main className="hub">
      <header>
        <small>Aura starter collection</small>
        <h1>
          Pick a product.
          <br />
          Make it yours.
        </h1>
        <p>
          Each link opens a standalone Next.js starter over real Aura REST data.
          No demo chrome follows you inside.
        </p>
      </header>
      <section>
        {apps.map(([path, title, detail]) => (
          <a key={path} href={`/${path}`}>
            <span>Starter</span>
            <h2>{title}</h2>
            <p>{detail}</p>
            <b>Open app →</b>
          </a>
        ))}
      </section>
    </main>
  );
}
