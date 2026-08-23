"use client";
import * as React from "react";
import { games, type Game } from "../lib/aura";
import { pollWhileVisible } from "../lib/polling";

export function useSlate() {
  const [sport, setSport] = React.useState("MLB");
  const [items, setItems] = React.useState<Game[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setItems([]);
    setSelected(null);
    setError("");
    return pollWhileVisible(async (signal) => {
      try {
        const rows = await games(sport, signal);
        const sorted = [...rows].sort(
          (a, b) =>
            phase(a.phase) - phase(b.phase) || a.startsAtMs - b.startsAtMs,
        );
        setItems(sorted);
        setSelected((current) =>
          sorted.some((game) => game.gameId === current)
            ? current
            : sorted[0]?.gameId || null,
        );
        setError("");
      } catch (reason) {
        if (!signal.aborted) {
          setItems([]);
          setSelected(null);
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      }
    }, 15_000);
  }, [sport]);

  return {
    sport,
    setSport,
    items,
    selected,
    setSelected,
    game: items.find((item) => item.gameId === selected) || null,
    error,
  };
}

function phase(value: string) {
  return value === "in_progress" ? 0 : value === "scheduled" ? 1 : 2;
}
