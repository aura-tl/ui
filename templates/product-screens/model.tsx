"use client";
import * as React from "react";
import { type DraftRow } from "../lib/aura";
import { useDraft } from "../hooks/use-draft";

type Weights = {
  pass: number;
  rush: number;
  receive: number;
  turnover: number;
};

export function Product() {
  const { rows, error } = useDraft();
  const [position, setPosition] = React.useState("QB");
  const [weights, setWeights] = React.useState<Weights>({
    pass: 1,
    rush: 1,
    receive: 1,
    turnover: 1,
  });
  const ranked = rows
    .filter((row) => row.position === position)
    .map((row) => ({ row, score: modelScore(row, weights) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  return (
    <main className="product">
      <header className="product__hero">
        <div>
          <small>Prediction starter</small>
          <h1>Model lab</h1>
          <p>
            Change the thesis, rerank retained 2026 projections, and own every
            line of the model.
          </p>
        </div>
        <aside>
          <strong>{rows.length}</strong>
          <span>projection rows</span>
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
      <div className="workbench workbench--wide">
        <aside className="rail">
          <h2>Weights</h2>
          <p className="state">
            Aura supplies the projections; these sliders are your thesis.
          </p>
        </aside>
        <section className="panel">
          <div className="model-controls">
            {Object.entries(weights).map(([name, value]) => (
              <label key={name}>
                {name} × {value.toFixed(1)}
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={value}
                  onChange={(event) =>
                    setWeights((all) => ({
                      ...all,
                      [name]: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ))}
          </div>
          {error ? (
            <p className="state">{error}</p>
          ) : (
            <div className="rank-list">
              {ranked.map(({ row, score }, index) => (
                <article key={row.entityId}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <div>
                    <strong>{row.name || row.entityId}</strong>
                    <span>
                      {row.position} · {row.teamId || "Team unavailable"}
                    </span>
                  </div>
                  <em>{score.toFixed(1)}</em>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function modelScore(row: DraftRow, weights: Weights) {
  const p = row.projection || {};
  return (
    ((p.passingYards || 0) * 0.04 + (p.passingTouchdowns || 0) * 4) *
      weights.pass +
    ((p.rushingYards || 0) * 0.1 + (p.rushingTouchdowns || 0) * 6) *
      weights.rush +
    ((p.receivingYards || 0) * 0.1 +
      (p.receivingTouchdowns || 0) * 6 +
      (p.receptions || 0)) *
      weights.receive -
    ((p.interceptions || 0) * 2 + (p.fumblesLost || 0) * 2) * weights.turnover
  );
}
