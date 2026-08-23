"use client";

import * as React from "react";
import type { AnalysisPreset as AnalysisStudioPreset } from "@/lib/aura/analysis-presets";
import type {
  AuraAnalyticsPoint as LandscapePointModel,
  AuraLeagueLandscape as LeagueLandscapeModel,
} from "@/lib/aura/league-analytics-types";
import {
  formatLandscapeMetric,
  GoldenRing,
} from "@/components/aura/league-landscape";

type View = "landscape" | "table";

export function AnalysisStudio({
  model,
  presets,
  activePresetId,
  onPresetChange,
}: {
  model: LeagueLandscapeModel;
  presets: AnalysisStudioPreset[];
  activePresetId: string;
  onPresetChange: (id: string) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [team, setTeam] = React.useState("all");
  const [quadrant, setQuadrant] = React.useState("all");
  const [view, setView] = React.useState<View>("landscape");
  const activePreset =
    presets.find((preset) => preset.id === activePresetId) || presets[0];
  const zones = activePreset.zones;
  React.useEffect(() => {
    setSearch("");
    setTeam("all");
    setQuadrant("all");
  }, [activePresetId]);
  const teams = Array.from(
    new Set(
      model.points.map((point) => point.team).filter(Boolean) as string[],
    ),
  ).sort();
  const points = model.points.filter(
    (point) =>
      (!search ||
        `${point.name} ${point.team || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (team === "all" || point.team === team) &&
      (quadrant === "all" || point.quadrant === quadrant),
  );
  const filteredModel = {
    ...model,
    points,
    domains: {
      ...model.domains,
      x: focusedDomain(model.points.map((point) => point.x)),
      y: focusedDomain(model.points.map((point) => point.y)),
    },
  };
  return (
    <article className="aura-analysis-studio">
      <header className="aura-analysis-studio__top">
        <div>
          <span>{activePreset.cohortLabel.toUpperCase()} / LANDSCAPE</span>
          <h2>{activePreset.label}</h2>
          <p>{activePreset.question}</p>
          <small>
            {model.sample.returnedEntities.toLocaleString()}{" "}
            {entityLabel(model.entityType, true)} shown from{" "}
            {model.sample.games} retained games. The plot centers the middle
            90%; edge rings mark values beyond that scale.
          </small>
        </div>
        <div className="aura-analysis-studio__views" aria-label="Analysis view">
          <button
            type="button"
            className={view === "landscape" ? "is-active" : ""}
            onClick={() => setView("landscape")}
          >
            Landscape
          </button>
          <button
            type="button"
            className={view === "table" ? "is-active" : ""}
            onClick={() => setView("table")}
          >
            Table
          </button>
        </div>
      </header>
      <nav
        className="aura-analysis-studio__presets"
        aria-label="Analysis preset"
      >
        {presets.map((preset, index) => (
          <button
            key={preset.id}
            type="button"
            className={preset.id === activePresetId ? "is-active" : ""}
            onClick={() => onPresetChange(preset.id)}
          >
            <span>0{index + 1}</span>
            {preset.label}
          </button>
        ))}
      </nav>
      <div className="aura-analysis-studio__filters">
        <label>
          <span>Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              model.entityType === "player" ? "Player or team" : "Team"
            }
          />
        </label>
        {model.entityType === "player" && (
          <label>
            <span>Team</span>
            <select
              value={team}
              onChange={(event) => setTeam(event.target.value)}
            >
              <option value="all">All teams</option>
              {teams.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          <span>Quadrant</span>
          <select
            value={quadrant}
            onChange={(event) => setQuadrant(event.target.value)}
          >
            <option value="all">All quadrants</option>
            <option value="high-high">{zones.highHigh}</option>
            <option value="high-low">{zones.highLow}</option>
            <option value="low-high">{zones.lowHigh}</option>
            <option value="low-low">{zones.lowLow}</option>
          </select>
        </label>
        <strong>
          {points.length} / {model.points.length} visible
        </strong>
      </div>
      {view === "landscape" ? (
        <GoldenRing model={filteredModel} zones={zones} focusedRange />
      ) : (
        <AnalysisTable model={model} points={points} zones={zones} />
      )}
    </article>
  );
}

function AnalysisTable({
  model,
  points,
  zones,
}: {
  model: LeagueLandscapeModel;
  points: LandscapePointModel[];
  zones: AnalysisStudioPreset["zones"];
}) {
  const [sort, setSort] = React.useState<"x" | "y">("y");
  const rows = [...points].sort((a, b) => b[sort] - a[sort]);
  return (
    <div className="aura-analysis-table">
      <table>
        <thead>
          <tr>
            <th>{entityLabel(model.entityType, false)}</th>
            {model.entityType === "player" && <th>Team</th>}
            <th>
              <button type="button" onClick={() => setSort("x")}>
                {model.axes.x.label}
              </button>
            </th>
            <th>
              <button type="button" onClick={() => setSort("y")}>
                {model.axes.y.label}
              </button>
            </th>
            <th>Quadrant</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((point) => (
            <tr key={point.id}>
              <th>{point.name}</th>
              {model.entityType === "player" && <td>{point.team || "—"}</td>}
              <td>{formatLandscapeMetric(point.x, model.axes.x)}</td>
              <td>{formatLandscapeMetric(point.y, model.axes.y)}</td>
              <td>{quadrantLabel(point.quadrant, zones)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p>No {entityLabel(model.entityType, true)} match these filters.</p>
      )}
    </div>
  );
}

function focusedDomain(values: number[]): [number, number] {
  const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length < 4)
    return [sorted[0] || 0, sorted[sorted.length - 1] || 1];
  const low = sorted[Math.floor((sorted.length - 1) * 0.05)];
  const high = sorted[Math.ceil((sorted.length - 1) * 0.95)];
  return low === high ? [low - 0.01, high + 0.01] : [low, high];
}

function quadrantLabel(
  value: string,
  zones: AnalysisStudioPreset["zones"],
): string {
  return value === "high-high"
    ? zones.highHigh
    : value === "low-high"
      ? zones.lowHigh
      : value === "high-low"
        ? zones.highLow
        : zones.lowLow;
}

function entityLabel(entityType: string, plural: boolean) {
  const label = entityType.toLowerCase();
  return plural ? `${label}s` : label;
}
