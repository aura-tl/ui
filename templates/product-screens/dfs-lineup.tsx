"use client";
import * as React from "react";
import { addLineupPlayer, scoreProjection, type DraftRow } from "../lib/aura";
import { useDraft } from "../hooks/use-draft";

const slots = ["QB", "RB1", "RB2", "WR1", "WR2", "WR3", "TE", "FLEX"];

export function Product() {
  const { rows, error } = useDraft();
  const [position, setPosition] = React.useState("QB");
  const [lineup, setLineup] = React.useState<Record<string, DraftRow>>({});
  const candidates = rows
    .filter((row) => row.position === position)
    .sort((a, b) => scoreProjection(b) - scoreProjection(a))
    .slice(0, 30);
  const total = Object.values(lineup).reduce(
    (sum, row) => sum + scoreProjection(row),
    0,
  );

  const add = (row: DraftRow) => {
    setLineup((all) => addLineupPlayer(all, row, slots));
  };

  return (
    <main className="product">
      <header className="product__hero">
        <div>
          <small>DFS-style starter</small>
          <h1>Lineup builder</h1>
          <p>
            Build around retained projections. Add operator salaries before
            optimizing.
          </p>
        </div>
        <aside>
          <strong>{total.toFixed(1)}</strong>
          <span>projected points</span>
        </aside>
      </header>
      <nav className="toolbar">
        {["QB", "RB", "WR", "TE"].map((value) => (
          <button
            key={value}
            aria-pressed={value === position}
            onClick={() => setPosition(value)}
          >
            {value}
          </button>
        ))}
      </nav>
      {error ? (
        <p className="state">{error}</p>
      ) : (
        <div className="workbench">
          <aside className="rail">
            <h2>{position} pool</h2>
            {candidates.map((row) => {
              const selected = Object.values(lineup).some(
                (player) => player.entityId === row.entityId,
              );
              return (
                <button
                  className="game-option"
                  key={row.entityId}
                  onClick={() => add(row)}
                  disabled={selected}
                >
                  <strong>{row.name || row.entityId}</strong>
                  <span>
                    {selected
                      ? "Already selected"
                      : `${scoreProjection(row)} projected points`}
                  </span>
                </button>
              );
            })}
            {!candidates.length ? (
              <p className="state">No retained {position} projections.</p>
            ) : null}
          </aside>
          <section className="panel">
            <header className="panel__head">
              <strong>Your lineup</strong>
              <span>
                {Object.keys(lineup).length} / {slots.length}
              </span>
            </header>
            <p className="notice">
              Aura does not currently retain operator salaries. This starter
              will not invent a cap or claim an optimized contest lineup.
            </p>
            <div className="lineup">
              {slots.map((slot) => {
                const row = lineup[slot];
                return (
                  <section key={slot}>
                    <small>{slot}</small>
                    {row ? (
                      <>
                        <button
                          onClick={() =>
                            setLineup((all) => {
                              const next = { ...all };
                              delete next[slot];
                              return next;
                            })
                          }
                        >
                          ×
                        </button>
                        <strong>{row.name || row.entityId}</strong>
                        <span>{scoreProjection(row)} projected points</span>
                      </>
                    ) : (
                      <p className="state">Open slot</p>
                    )}
                  </section>
                );
              })}
            </div>
          </section>
          <aside className="slip">
            <h2 className="panel__head">Build notes</h2>
            <p className="slip__empty">
              Add a salary feed, ownership projections, stacking rules, and an
              optimizer without changing Aura player identities.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
