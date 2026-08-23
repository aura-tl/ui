"use client";
import * as React from "react";
import { draft, type DraftRow } from "../lib/aura";
import { pollWhileVisible } from "../lib/polling";

export function useDraft() {
  const [rows, setRows] = React.useState<DraftRow[]>([]);
  const [error, setError] = React.useState("");

  React.useEffect(
    () =>
      pollWhileVisible(async (signal) => {
        try {
          const body = await draft(signal);
          setRows(body.items || []);
          setError("");
        } catch (reason) {
          if (!signal.aborted) {
            setRows([]);
            setError(reason instanceof Error ? reason.message : String(reason));
          }
        }
      }, 300_000),
    [],
  );

  return { rows, error };
}
