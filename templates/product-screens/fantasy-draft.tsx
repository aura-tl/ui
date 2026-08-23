"use client";
import * as React from "react";
import { adp, scoreProjection, type Scoring } from "../lib/aura";
import { useDraft } from "../hooks/use-draft";

const scoringOptions: Array<{
  label: string;
  reception: number;
  key: Scoring;
}> = [
  { label: "Standard", reception: 0, key: "standard" },
  { label: "Half PPR", reception: 0.5, key: "halfPpr" },
  { label: "PPR", reception: 1, key: "ppr" },
];

export function Product() {
  const { rows, error } = useDraft();
  const [position, setPosition] = React.useState("ALL");
  const [scoring, setScoring] = React.useState<Scoring>("ppr");
  const [drafted, setDrafted] = React.useState<string[]>([]);
  const reception = scoringOptions.find(
    (option) => option.key === scoring,
  )!.reception;
  const shown = rows
    .filter((row) => row.entityType !== "team_defense")
    .filter((row) => position === "ALL" || row.position === position)
    .map((row) => ({ row, points: scoreProjection(row, reception) }))
    .sort((a, b) => (adp(a.row, scoring) ?? 999) - (adp(b.row, scoring) ?? 999))
    .slice(0, 80);

  return (
    <main className="product">
      <header className="product__hero">
        <div>
          <small>Fantasy football starter</small>
          <h1>Draft room</h1>
          <p>
            Consensus draft order beside recomputable season projections, ready
            for your league rules.
          </p>
        </div>
        <aside>
          <strong>{rows.length}</strong>
          <span>retained players</span>
        </aside>
      </header>
      <div className="toolbar">
        <div className="segmented">
          {scoringOptions.map((option) => (
            <button
              key={option.key}
              aria-pressed={option.key === scoring}
              onClick={() => setScoring(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {["ALL", "QB", "RB", "WR", "TE"].map((value) => (
          <button
            key={value}
            aria-pressed={value === position}
            onClick={() => setPosition(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="workbench workbench--wide">
        <aside className="rail">
          <h2>Your draft</h2>
          <p className="state">
            Mark players as drafted. Extend the copied source for your league.
          </p>
        </aside>
        <section className="panel">
          {error ? (
            <p className="state">{error}</p>
          ) : (
            <div className="rank-list">
              {shown.map(({ row, points }, index) => {
                const draftPosition = adp(row, scoring);
                const isDrafted = drafted.includes(row.entityId);
                return (
                  <article
                    key={row.entityId}
                    style={{ opacity: isDrafted ? 0.45 : 1 }}
                  >
                    <b>
                      {draftPosition === null
                        ? String(index + 1)
                        : draftPosition.toFixed(1)}
                    </b>
                    <div>
                      <strong>{row.name || row.entityId}</strong>
                      <span>
                        {row.position} · projected {points} points
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setDrafted((all) =>
                          isDrafted
                            ? all.filter((id) => id !== row.entityId)
                            : [...all, row.entityId],
                        )
                      }
                    >
                      {isDrafted ? "Undo" : "Draft"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
