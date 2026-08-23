"use client";
import * as React from "react";
import {
  currentGameValue,
  gameName,
  marketOutcomes,
  odds,
  price,
  props,
  reconcileMarketSelections,
  type MarketSelection,
  type Odds,
  type Outcome,
} from "../lib/aura";
import { useSlate } from "../hooks/use-slate";
import { pollWhileVisible } from "../lib/polling";

type Pick = MarketSelection;

export function Product() {
  const slate = useSlate();
  const gameId = slate.game?.gameId || null;
  const [marketState, setMarketState] = React.useState<{
    gameId: string;
    value: Record<string, Odds | null>;
  } | null>(null);
  const [propState, setPropState] = React.useState<{
    gameId: string;
    value: number;
  } | null>(null);
  const [picks, setPicks] = React.useState<Pick[]>([]);

  React.useEffect(() => {
    setMarketState(null);
    setPropState(null);
    setPicks([]);
    if (!gameId) return;
    const game = gameName(slate.game!);
    return pollWhileVisible(async (signal) => {
      try {
        const [markets, propBoard] = await Promise.all([
          Promise.all(
            ["moneyline", "spread", "total"].map(
              async (type) => [type, await odds(gameId, type, signal)] as const,
            ),
          ),
          props(gameId, signal),
        ]);
        const value = Object.fromEntries(markets);
        setMarketState({ gameId, value });
        setPropState({ gameId, value: propBoard?.props?.length || 0 });
        setPicks((all) => reconcileMarketSelections(gameId, game, value, all));
      } catch {
        if (!signal.aborted) {
          setMarketState({ gameId, value: {} });
          setPropState({ gameId, value: 0 });
          setPicks([]);
        }
      }
    }, 15_000);
  }, [gameId]);

  const markets = currentGameValue(gameId, marketState, {});
  const propCount = currentGameValue(gameId, propState, 0);
  const toggle = (pick: Pick) =>
    setPicks((all) =>
      all.some((item) => item.id === pick.id)
        ? all.filter((item) => item.id !== pick.id)
        : [...all, pick],
    );

  return (
    <main className="product">
      <Hero stat={`${slate.items.length} games`} />
      <Sports slate={slate} />
      <div className="workbench">
        <Games slate={slate} />
        <section className="panel">
          <header className="panel__head">
            <strong>
              {slate.game ? gameName(slate.game) : "No game selected"}
            </strong>
            <span>{propCount} linked props</span>
          </header>
          {slate.error ? (
            <p className="state">{slate.error}</p>
          ) : (
            <div className="market-grid">
              {["moneyline", "spread", "total"].map((type) => (
                <Market
                  key={type}
                  type={type}
                  value={markets[type]}
                  gameId={gameId || ""}
                  game={slate.game ? gameName(slate.game) : ""}
                  picks={picks}
                  toggle={toggle}
                />
              ))}
            </div>
          )}
        </section>
        <aside className="slip">
          <h2 className="panel__head">
            Selection slip <span>{picks.length}</span>
          </h2>
          {picks.length ? (
            picks.map((pick) => (
              <article key={pick.id}>
                <button onClick={() => toggle(pick)}>×</button>
                <strong>
                  {pick.label} {price(pick.price)}
                </strong>
                <span>
                  {pick.game} · {pick.market}
                </span>
              </article>
            ))
          ) : (
            <p className="slip__empty">
              Tap a retained outcome to sketch the betting product around it.
              This starter does not place wagers.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

function Market({
  type,
  value,
  gameId,
  game,
  picks,
  toggle,
}: {
  type: string;
  value: Odds | null | undefined;
  gameId: string;
  game: string;
  picks: Pick[];
  toggle: (pick: Pick) => void;
}) {
  const outcomes = marketOutcomes(value);
  return (
    <article className="market">
      <header>
        <strong>{type}</strong>
        <small>
          {value?.sourceCount || 0} inputs
          {value?.consensus?.line == null
            ? ""
            : ` · line ${value.consensus.line}`}
        </small>
      </header>
      {outcomes.length ? (
        <div className="outcomes">
          {outcomes.map((outcome, index) => {
            const label =
              outcome.label || outcome.side || `Outcome ${index + 1}`;
            const side = outcome.side || outcome.label || String(index);
            const id = `${gameId}:${type}:${side}`;
            const pick = {
              id,
              gameId,
              game,
              market: type,
              side,
              label,
              price: outcome.price,
            };
            return (
              <OutcomeButton
                key={id}
                outcome={outcome}
                selected={picks.some((item) => item.id === id)}
                onClick={() => toggle(pick)}
              />
            );
          })}
        </div>
      ) : (
        <p className="state">No retained {type} is available.</p>
      )}
    </article>
  );
}

function OutcomeButton({
  outcome,
  selected,
  onClick,
}: {
  outcome: Outcome;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button className={selected ? "is-selected" : ""} onClick={onClick}>
      <span>{outcome.label || outcome.side || "Outcome"}</span>
      <b>{price(outcome.price)}</b>
      <small>Consensus price</small>
    </button>
  );
}

function Hero({ stat }: { stat: string }) {
  return (
    <header className="product__hero">
      <div>
        <small>Live betting starter</small>
        <h1>Against the house</h1>
        <p>
          A working market board and selection slip over Aura consensus odds.
        </p>
      </div>
      <aside>
        <strong>{stat}</strong>
        <span>today in Aura</span>
      </aside>
    </header>
  );
}

function Sports({ slate }: { slate: ReturnType<typeof useSlate> }) {
  return (
    <nav className="toolbar">
      {["MLB", "WNBA", "NFL"].map((sport) => (
        <button
          key={sport}
          aria-pressed={slate.sport === sport}
          onClick={() => slate.setSport(sport)}
        >
          {sport}
        </button>
      ))}
    </nav>
  );
}

function Games({ slate }: { slate: ReturnType<typeof useSlate> }) {
  return (
    <aside className="rail">
      <h2>Today</h2>
      {slate.items.map((game) => (
        <button
          className={`game-option ${game.gameId === slate.selected ? "is-active" : ""}`}
          key={game.gameId}
          onClick={() => slate.setSelected(game.gameId)}
        >
          <strong>{gameName(game)}</strong>
          <span>
            {game.phase.replace("_", " ")} ·{" "}
            {game.statusDetail || game.statusText}
          </span>
        </button>
      ))}
    </aside>
  );
}
