"use client";
import * as React from "react";
import {
  currentGameValue,
  gameDetail,
  gameName,
  marketOutcomes,
  price,
  type GameDetail,
} from "../lib/aura";
import { pollWhileVisible } from "../lib/polling";
import { useSlate } from "../hooks/use-slate";

export function Product() {
  const slate = useSlate();
  const gameId = slate.game?.gameId || null;
  const [detailState, setDetailState] = React.useState<{
    gameId: string;
    value: GameDetail;
  } | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setDetailState(null);
    setError("");
    if (!gameId) return;
    return pollWhileVisible(async (signal) => {
      try {
        setDetailState({ gameId, value: await gameDetail(gameId, signal) });
        setError("");
      } catch (reason) {
        if (!signal.aborted) {
          setDetailState(null);
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      }
    }, 15_000);
  }, [gameId]);

  const detail = currentGameValue<GameDetail | null>(gameId, detailState, null);
  return (
    <main className="product">
      <header className="product__hero">
        <div>
          <small>Live scores starter</small>
          <h1>
            Game day,
            <br />
            without the noise.
          </h1>
          <p>
            Today’s real scoreboard with a focused matchup, recent plays, box
            score, odds, and props.
          </p>
        </div>
        <aside>
          <strong>{slate.items.length} games</strong>
          <span>today in Aura</span>
        </aside>
      </header>
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
      <div className="workbench workbench--wide">
        <aside className="rail">
          <h2>Today</h2>
          {slate.items.map((game) => (
            <button
              key={game.gameId}
              className={`game-option ${game.gameId === slate.selected ? "is-active" : ""}`}
              onClick={() => slate.setSelected(game.gameId)}
            >
              <strong>{gameName(game)}</strong>
              <span>
                {game.phase.replace("_", " ")} · {game.teams.away.score ?? "—"}–
                {game.teams.home.score ?? "—"}
              </span>
            </button>
          ))}
        </aside>
        <section className="panel">
          <header className="panel__head">
            <strong>
              {slate.game ? gameName(slate.game) : "No game selected"}
            </strong>
            <span>
              {slate.game?.statusDetail || slate.game?.statusText || ""}
            </span>
          </header>
          {error ? (
            <p className="state">{error}</p>
          ) : detail ? (
            <Detail detail={detail} />
          ) : (
            <p className="state">
              {gameId
                ? "Loading matchup…"
                : `No ${slate.sport} game is available.`}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function Detail({ detail }: { detail: GameDetail }) {
  const outcomes = marketOutcomes(detail.moneyline);
  return (
    <div className="detail-grid">
      <article className="market">
        <header>
          <strong>Recent plays</strong>
          <small>{detail.plays.length}</small>
        </header>
        {detail.plays.length ? (
          detail.plays.map((play, index) => (
            <p key={play.id || index}>
              <b>{play.inning || play.period || play.clock || "•"}</b>{" "}
              {play.text || "Play detail unavailable"}
            </p>
          ))
        ) : (
          <p className="state">No retained plays.</p>
        )}
      </article>
      <article className="market">
        <header>
          <strong>Box score</strong>
          <small>{detail.boxscore.length}</small>
        </header>
        {detail.boxscore.length ? (
          <div className="box-tables">
            {detail.boxscore.map((table, tableIndex) => (
              <section key={`${table.team}:${table.kind}:${tableIndex}`}>
                <h3>
                  {table.team} · {table.kind}
                </h3>
                <div className="box-row box-row--head">
                  <span>Player</span>
                  {table.columns.map((column) => (
                    <b key={column}>{column}</b>
                  ))}
                </div>
                {table.rows.slice(0, 10).map((player, playerIndex) => (
                  <div
                    className="box-row"
                    key={`${player.name}:${playerIndex}`}
                  >
                    <span>
                      {player.name}
                      <small>{player.position}</small>
                    </span>
                    {player.values.map((value, valueIndex) => (
                      <b key={valueIndex}>{value ?? "—"}</b>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <p className="state">No retained box score.</p>
        )}
      </article>
      <article className="market">
        <header>
          <strong>Moneyline</strong>
          <small>{detail.moneyline?.sourceCount || 0} inputs</small>
        </header>
        {outcomes.length ? (
          <div className="outcomes">
            {outcomes.map((outcome) => (
              <button key={outcome.side || outcome.label} disabled>
                <span>{outcome.label || outcome.side}</span>
                <b>{price(outcome.price)}</b>
              </button>
            ))}
          </div>
        ) : (
          <p className="state">No retained moneyline.</p>
        )}
      </article>
      <article className="market">
        <header>
          <strong>Player props</strong>
          <small>{detail.props.length}</small>
        </header>
        {detail.props.length ? (
          detail.props.slice(0, 8).map((prop, index) => (
            <p key={prop.id || index}>
              <b>{prop.player?.displayName || prop.player?.name || "Player"}</b>{" "}
              {prop.definition?.displayName || prop.definition?.label || "Prop"}{" "}
              {prop.line ?? "—"}
            </p>
          ))
        ) : (
          <p className="state">No retained player props.</p>
        )}
      </article>
    </div>
  );
}
