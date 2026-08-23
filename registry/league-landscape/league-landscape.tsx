"use client";

import * as React from "react";
import type {
  AuraAnalyticsAxis as LandscapeAxisModel,
  AuraLeagueLandscape as LeagueLandscapeModel,
} from "@/lib/aura/league-analytics-types";

export type LandscapeZoneLabels = {
  highHigh: string;
  lowHigh: string;
  highLow: string;
  lowLow: string;
};

const defaultZones: LandscapeZoneLabels = {
  highHigh: "Above both",
  lowHigh: "Y metric first",
  highLow: "X metric first",
  lowLow: "Below both",
};

export function LeagueLandscape({
  model,
  zones = defaultZones,
  focusedRange = false,
}: {
  model: LeagueLandscapeModel;
  zones?: LandscapeZoneLabels;
  focusedRange?: boolean;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  React.useEffect(
    () => setSelectedId(null),
    [model.generatedAt, model.axes.x.definitionId, model.axes.y.definitionId],
  );
  const selected = model.points.find((point) => point.id === selectedId);
  const chart = geometry(model);
  return (
    <article
      className="aura-league-landscape"
      aria-label={`${axisLabel(model.axes.x)} by ${axisLabel(model.axes.y)} ${model.entityType} map`}
    >
      <header className="aura-landscape-header">
        <div>
          <span className="aura-eyebrow">
            {model.entityType.toUpperCase()} MAP
          </span>
          <h2>
            {axisLabel(model.axes.y)} <i>vs</i> {axisLabel(model.axes.x)}
          </h2>
          <p>
            Every {entityLabel(model.entityType, false)} included
            {focusedRange ? " · middle 90% display range" : ""}
          </p>
        </div>
        <div className="aura-landscape-legend">
          <span>
            <i className="is-player" /> {entityLabel(model.entityType, false)}
          </span>
          <span>
            <i className="is-selected" /> Selected
          </span>
          <span>
            <i className="is-median" /> League median
          </span>
          {focusedRange && (
            <span>
              <i className="is-outside" /> Outside scale
            </span>
          )}
        </div>
      </header>
      <div className="aura-landscape-grid">
        <section className="aura-landscape-plot">
          <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img">
            <title>{`${axisLabel(model.axes.x)} versus ${axisLabel(model.axes.y)}`}</title>
            <g className="aura-landscape-zones" aria-hidden="true">
              <rect
                x={chart.xSplit}
                y={chart.top}
                width={chart.right - chart.xSplit}
                height={chart.ySplit - chart.top}
              />
              <line
                x1={chart.xSplit}
                x2={chart.xSplit}
                y1={chart.top}
                y2={chart.bottom}
              />
              <line
                x1={chart.left}
                x2={chart.right}
                y1={chart.ySplit}
                y2={chart.ySplit}
              />
              <text x={chart.right - 10} y={chart.top + 18} textAnchor="end">
                {zones.highHigh.toUpperCase()}
              </text>
              <text x={chart.left + 10} y={chart.top + 18}>
                {zones.lowHigh.toUpperCase()}
              </text>
              <text x={chart.right - 10} y={chart.bottom - 12} textAnchor="end">
                {zones.highLow.toUpperCase()}
              </text>
              <text x={chart.left + 10} y={chart.bottom - 12}>
                {zones.lowLow.toUpperCase()}
              </text>
            </g>
            <g className="aura-landscape-points">
              {chart.points.map(({ point, cx, cy, outside }) => (
                <g
                  key={point.id}
                  className={[
                    selected?.id === point.id ? "is-selected" : "",
                    outside ? "is-outside" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="button"
                  tabIndex={0}
                  aria-label={`${point.name}: ${axisLabel(model.axes.x)} ${formatLandscapeMetric(point.x, model.axes.x)}, ${axisLabel(model.axes.y)} ${formatLandscapeMetric(point.y, model.axes.y)}${outside ? ", outside display scale" : ""}`}
                  onClick={() => setSelectedId(point.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ")
                      setSelectedId(point.id);
                  }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={selected?.id === point.id ? 7 : 4}
                  />
                  {selected?.id === point.id && (
                    <text x={cx + 10} y={cy - 10}>
                      {point.name}
                    </text>
                  )}
                </g>
              ))}
            </g>
            <g className="aura-landscape-axes" aria-hidden="true">
              <line
                x1={chart.left}
                x2={chart.right}
                y1={chart.bottom}
                y2={chart.bottom}
              />
              <line
                x1={chart.left}
                x2={chart.left}
                y1={chart.top}
                y2={chart.bottom}
              />
              <text
                x={(chart.left + chart.right) / 2}
                y={chart.height - 12}
                textAnchor="middle"
              >
                {axisLabel(model.axes.x).toUpperCase()}
              </text>
              <text
                transform={`translate(15 ${(chart.top + chart.bottom) / 2}) rotate(-90)`}
                textAnchor="middle"
              >
                {axisLabel(model.axes.y).toUpperCase()}
              </text>
              <text x={chart.left} y={chart.bottom + 19}>
                {formatLandscapeMetric(model.domains.x[0], model.axes.x)}
              </text>
              <text x={chart.right} y={chart.bottom + 19} textAnchor="end">
                {formatLandscapeMetric(model.domains.x[1], model.axes.x)}
              </text>
              <text x={chart.left - 9} y={chart.bottom} textAnchor="end">
                {formatLandscapeMetric(model.domains.y[0], model.axes.y)}
              </text>
              <text x={chart.left - 9} y={chart.top + 4} textAnchor="end">
                {formatLandscapeMetric(model.domains.y[1], model.axes.y)}
              </text>
            </g>
          </svg>
        </section>
        <aside className="aura-landscape-inspector">
          <header>
            <span>{model.entityType.toUpperCase()}</span>
            <strong>
              {selected ? quadrantLabel(selected.quadrant, zones) : "NO MATCH"}
            </strong>
          </header>
          {selected ? (
            <>
              <div className="aura-landscape-identity">
                <span>
                  {[selected.team, selected.position]
                    .filter(Boolean)
                    .join(" · ") || model.entityType.toUpperCase()}
                </span>
                <h3>{selected.name}</h3>
                <p>{quadrantLabel(selected.quadrant, zones)}</p>
              </div>
              <dl>
                <MetricValue
                  label={axisLabel(model.axes.x)}
                  value={formatLandscapeMetric(selected.x, model.axes.x)}
                />
                <MetricValue
                  label={axisLabel(model.axes.y)}
                  value={formatLandscapeMetric(selected.y, model.axes.y)}
                />
              </dl>
              <section className="aura-landscape-read">
                <span>COHORT POSITION</span>
                <strong>{summary(selected.quadrant, zones)}</strong>
                <small>
                  {axisLabel(model.axes.x)} p
                  {Math.round(selected.percentile.x * 100)} ·{" "}
                  {axisLabel(model.axes.y)} p
                  {Math.round(selected.percentile.y * 100)}
                </small>
              </section>
            </>
          ) : (
            <div className="aura-landscape-empty">
              <strong>Select a {entityLabel(model.entityType, false)}</strong>
              <p>Choose any dot to see exact values and league percentiles.</p>
            </div>
          )}
        </aside>
      </div>
      <footer className="aura-landscape-footer">
        <span>
          {model.points.length.toLocaleString()}{" "}
          {entityLabel(model.entityType, true)} shown
        </span>
        <span>Lines mark league medians</span>
        <strong>
          {focusedRange
            ? "Edge rings continue beyond scale"
            : "Exact retained values"}
        </strong>
      </footer>
    </article>
  );
}

export function GoldenRing({
  model,
  zones,
  focusedRange,
}: {
  model: LeagueLandscapeModel;
  zones?: LandscapeZoneLabels;
  focusedRange?: boolean;
}) {
  return (
    <LeagueLandscape model={model} zones={zones} focusedRange={focusedRange} />
  );
}
function MetricValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
function quadrantLabel(value: string, zones: LandscapeZoneLabels) {
  return value === "high-high"
    ? zones.highHigh
    : value === "low-high"
      ? zones.lowHigh
      : value === "high-low"
        ? zones.highLow
        : zones.lowLow;
}
function summary(value: string, zones: LandscapeZoneLabels) {
  return value === "high-high"
    ? `Above the league median in both: ${zones.highHigh.toLowerCase()}`
    : value === "low-high"
      ? `${zones.lowHigh} stands out`
      : value === "high-low"
        ? `${zones.highLow} stands out`
        : "Below the league median in both";
}
function geometry(model: LeagueLandscapeModel) {
  const width = 900,
    height = 540,
    left = 72,
    right = 875,
    top = 28,
    bottom = 492;
  const x = (value: number) => scale(value, model.domains.x, [left, right]),
    y = (value: number) => scale(value, model.domains.y, [bottom, top]);
  return {
    width,
    height,
    left,
    right,
    top,
    bottom,
    xSplit: x(model.quadrants.xSplit),
    ySplit: y(model.quadrants.ySplit),
    points: model.points.map((point) => ({
      point,
      cx: x(point.x),
      cy: y(point.y),
      outside:
        point.x < model.domains.x[0] ||
        point.x > model.domains.x[1] ||
        point.y < model.domains.y[0] ||
        point.y > model.domains.y[1],
    })),
  };
}
function scale(
  value: number,
  domain: [number, number],
  range: [number, number],
) {
  const progress =
    (value - domain[0]) / Math.max(Number.EPSILON, domain[1] - domain[0]);
  return range[0] + Math.max(0, Math.min(1, progress)) * (range[1] - range[0]);
}
export function formatLandscapeMetric(
  value: number | null,
  axis: LandscapeAxisModel,
) {
  if (value === null || !Number.isFinite(value)) return "—";
  const unit = axis.unit || {};
  if (unit.kind === "percentage" && axis.definitionId.startsWith("baseball."))
    return value.toFixed(3).replace(/^0/, "");
  if (unit.kind === "probability") return `${(value * 100).toFixed(1)}%`;
  const scaled = value * (unit.scale ?? 1);
  if (unit.kind === "percentage")
    return `${scaled.toFixed(Number.isInteger(scaled) ? 0 : 1)}%`;
  let formatted: string;
  if (Math.abs(scaled) < 1)
    formatted = scaled.toFixed(3).replace(/^(-?)0/, "$1");
  else if (Math.abs(scaled) < 10) formatted = scaled.toFixed(1);
  else formatted = Math.round(scaled).toLocaleString();
  const separator = unit.symbol && /^[A-Za-z]/.test(unit.symbol) ? " " : "";
  return `${formatted}${separator}${unit.symbol || ""}`;
}
function axisLabel(axis: {
  label: string;
  dimensions: Record<string, string | number | boolean>;
}) {
  return axis.label;
}

function entityLabel(entityType: string, plural: boolean) {
  const label = entityType.toLowerCase();
  return plural ? `${label}s` : label;
}

export type { AuraLeagueLandscape as LeagueLandscapeModel } from "@/lib/aura/league-analytics-types";
