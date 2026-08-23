"use client";
import * as React from "react";
import {
  currentGameValue,
  gameName,
  price,
  props,
  reconcilePropSelections,
  type Prop,
} from "../lib/aura";
import { useSlate } from "../hooks/use-slate";
import { pollWhileVisible } from "../lib/polling";

export function Product() {
  const slate = useSlate();
  const gameId = slate.game?.gameId || null;
  const [propState, setPropState] = React.useState<{
    gameId: string;
    value: Prop[];
  } | null>(null);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    setPropState(null);
    setSelected([]);
    if (!gameId) return;

    return pollWhileVisible(async (signal) => {
      try {
        const body = await props(gameId, signal);
        const value = body?.props || [];
        setPropState({ gameId, value });
        setSelected((all) => reconcilePropSelections(value, all));
      } catch {
        if (!signal.aborted) {
          setPropState({ gameId, value: [] });
          setSelected([]);
        }
      }
    }, 15_000);
  }, [gameId]);

  const rows = currentGameValue(gameId, propState, []);
  const shown = rows.filter((row) =>
    `${row.player?.displayName || row.player?.name || ""} ${row.definition?.displayName || row.definition?.label || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="product">
      <header className="product__hero">
        <div>
          <small>Player prop starter</small>
          <h1>Prop research</h1>
          <p>
            Search the real board, compare both sides, and save a short research
            card.
          </p>
        </div>
        <aside>
          <strong>{rows.length}</strong>
          <span>retained props</span>
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
      <div className="workbench">
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
            <span>{shown.length} shown</span>
          </header>
          <input
            className="search"
            placeholder="Player or market"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="prop-grid">
            {shown.map((row, index) => {
              const id = row.id || String(index);
              const player =
                row.player?.displayName || row.player?.name || "Player";
              const market =
                row.definition?.displayName ||
                row.definition?.label ||
                "Player prop";
              return (
                <article className="prop-card" key={id}>
                  <strong>{player}</strong>
                  <span>
                    {market} · line {row.line ?? "—"}
                  </span>
                  <div className="outcomes">
                    {(row.outcomes || [])
                      .slice(0, 2)
                      .map((outcome, outcomeIndex) => {
                        const selectionId = `${id}:${outcome.side || outcome.label || outcomeIndex}`;
                        return (
                          <button
                            key={selectionId}
                            className={
                              selected.includes(selectionId)
                                ? "is-selected"
                                : ""
                            }
                            onClick={() =>
                              setSelected((all) =>
                                all.includes(selectionId)
                                  ? all.filter((value) => value !== selectionId)
                                  : [...all, selectionId],
                              )
                            }
                          >
                            <span>
                              {outcome.label || outcome.side || "Side"}
                            </span>
                            <b>{price(outcome.price)}</b>
                          </button>
                        );
                      })}
                  </div>
                </article>
              );
            })}
            {!shown.length ? (
              <p className="state">No retained props match this view.</p>
            ) : null}
          </div>
        </section>
        <aside className="slip">
          <h2 className="panel__head">
            Research card <span>{selected.length}</span>
          </h2>
          <p className="slip__empty">
            Selected lines stay local to this page. Extend the copied source
            into picks, alerts, or a subscriber product.
          </p>
        </aside>
      </div>
    </main>
  );
}
