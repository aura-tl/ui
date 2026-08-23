"use client";
import * as React from "react";
import {
  consensusPercentage,
  currentGameValue,
  gameName,
  odds,
  type Odds,
} from "../lib/aura";
import { useSlate } from "../hooks/use-slate";
import { pollWhileVisible } from "../lib/polling";

export function Product() {
  const slate = useSlate();
  const gameId = slate.game?.gameId || null;
  const [marketState, setMarketState] = React.useState<{
    gameId: string;
    value: Record<string, Odds | null>;
  } | null>(null);

  React.useEffect(() => {
    setMarketState(null);
    if (!gameId) return;

    return pollWhileVisible(async (signal) => {
      try {
        const markets = await Promise.all(
          ["moneyline", "spread", "total"].map(
            async (type) => [type, await odds(gameId, type, signal)] as const,
          ),
        );
        setMarketState({ gameId, value: Object.fromEntries(markets) });
      } catch {
        if (!signal.aborted) setMarketState({ gameId, value: {} });
      }
    }, 15_000);
  }, [gameId]);

  const markets = currentGameValue(gameId, marketState, {});
  return (
    <main className="product">
      <header className="product__hero">
        <div>
          <small>Pricing starter</small>
          <h1>Arbitrage watch</h1>
          <p>
            Audit complete consensus markets and expose the seam for future
            executable quote comparison.
          </p>
        </div>
        <aside>
          <strong>{slate.items.length}</strong>
          <span>games scanned</span>
        </aside>
      </header>
      <nav className="toolbar">
        {["MLB", "WNBA", "NFL"].map((sport) => (
          <button
            key={sport}
            aria-pressed={sport === slate.sport}
            onClick={() => slate.setSport(sport)}
          >
            {sport}
          </button>
        ))}
      </nav>
      <div className="workbench workbench--wide">
        <aside className="rail">
          <h2>Games</h2>
          {slate.items.map((game) => (
            <button
              key={game.gameId}
              className={`game-option ${game.gameId === slate.selected ? "is-active" : ""}`}
              onClick={() => slate.setSelected(game.gameId)}
            >
              <strong>{gameName(game)}</strong>
              <span>{game.phase.replace("_", " ")}</span>
            </button>
          ))}
        </aside>
        <section className="panel">
          <header className="panel__head">
            <strong>
              {slate.game ? gameName(slate.game) : "No game selected"}
            </strong>
            <span>Consensus pricing</span>
          </header>
          <p className="notice">
            Aura currently exposes normalized consensus here, not independently
            executable venue quotes. This starter never claims an arbitrage
            trade from consensus alone.
          </p>
          <div className="arb-summary">
            {["moneyline", "spread", "total"].map((type) => (
              <ConsensusCard key={type} type={type} value={markets[type]} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ConsensusCard({
  type,
  value,
}: {
  type: string;
  value: Odds | null | undefined;
}) {
  const percentage = consensusPercentage(value);
  return (
    <article>
      <span>{type}</span>
      <strong>{percentage === null ? "—" : `${percentage.toFixed(1)}%`}</strong>
      <p>
        {percentage === null
          ? "A complete two-sided consensus is unavailable."
          : "Complete fair consensus. Executable arbitrage needs independently actionable quotes."}
      </p>
    </article>
  );
}
