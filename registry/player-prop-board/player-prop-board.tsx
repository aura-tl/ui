'use client';
import * as React from 'react';
import type { AuraPlayerPropBoardModel, AuraPlayerPropModel } from '@/lib/aura/player-prop-board-types';

export interface AuraPlayerPropBoardProps {
  model: AuraPlayerPropBoardModel;
  category?: string;
  title?: string;
}

/**
 * The player-prop board for one game: props grouped per player with lines,
 * over/under or yes/no prices, and settlement once final. Only linked,
 * supported props are served — the board never fabricates inventory.
 */
export function AuraPlayerPropBoard({ model, category: initialCategory, title }: AuraPlayerPropBoardProps) {
  const [category, setCategory] = React.useState<string>(
    initialCategory && model.categories.includes(initialCategory) ? initialCategory : 'all'
  );
  const [expandedLines, setExpandedLines] = React.useState<Set<string>>(new Set());
  React.useEffect(() => {
    setCategory(initialCategory && model.categories.includes(initialCategory) ? initialCategory : 'all');
    setExpandedLines(new Set());
  }, [model.gameId, initialCategory]);
  const toggleLines = (propId: string) => {
    setExpandedLines((current) => {
      const next = new Set(current);
      if (next.has(propId)) next.delete(propId);
      else next.add(propId);
      return next;
    });
  };

  const players = model.players
    .map((group) => ({
      ...group,
      props: category === 'all' ? group.props : group.props.filter((prop) => prop.category === category),
    }))
    .filter((group) => group.props.length > 0);

  return (
    <section className="aura-prop-board" aria-label="Player props">
      <header>
        <div>
          <span>Player props</span>
          <h3>{title || `${model.propCount} linked props`}</h3>
        </div>
        <small>
          {model.settledCount > 0
            ? `${model.settledCount} settled`
            : model.generatedAt
              ? `As of ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(model.generatedAt)}`
              : 'Retained consensus'}
        </small>
      </header>

      {model.categories.length > 1 ? (
        <nav aria-label="Prop category">
          {['all', ...model.categories].map((option) => (
            <button key={option} type="button" aria-pressed={option === category} onClick={() => setCategory(option)}>
              {option === 'all' ? 'All' : option}
            </button>
          ))}
        </nav>
      ) : null}

      {players.length === 0 ? (
        <p className="aura-prop-board__empty">No linked props for this selection.</p>
      ) : (
        <ol>
          {players.map((group) => (
            <li key={group.playerId}>
              <header>
                <strong>{group.playerName}</strong>
                {group.teamId ? <small>{group.teamId.split(':').pop()?.toUpperCase()}</small> : null}
              </header>
              <div className="aura-prop-board__props">
                {group.props.map((prop) => (
                  <article key={prop.id} data-status={prop.status}>
                    <div className="aura-prop-board__market">
                      <strong>{prop.label}</strong>
                      <small>
                        {prop.line !== null ? `Line ${prop.line}` : 'Yes / No'}
                        {prop.status === 'live' ? ' · live' : prop.status === 'closed' ? ' · closed' : ''}
                      </small>
                    </div>
                    <div className="aura-prop-board__prices">
                      {prop.outcomes.map((outcome) => (
                        <span key={outcome.side} className={settledSide(prop) === outcome.side ? 'is-settled-hit' : ''}>
                          <small>{sideLabel(outcome.side)}</small>
                          <b>{outcome.priceLabel}</b>
                        </span>
                      ))}
                    </div>
                    {prop.alternates.length > 0 ? (
                      <div className="aura-prop-board__alternates">
                        <button
                          type="button"
                          aria-expanded={expandedLines.has(prop.id)}
                          onClick={() => toggleLines(prop.id)}
                        >
                          {expandedLines.has(prop.id)
                            ? 'Hide lines'
                            : `+${prop.alternates.length} more line${prop.alternates.length === 1 ? '' : 's'}`}
                        </button>
                        {expandedLines.has(prop.id) ? (
                          <ul>
                            {prop.alternates.map((alternate) => (
                              <li key={alternate.id}>
                                <small>Line {alternate.line ?? '—'}</small>
                                <span>
                                  {alternate.outcomes.map((outcome) => (
                                    <span key={outcome.side}>
                                      <small>{sideLabel(outcome.side)}</small> <b>{outcome.priceLabel}</b>
                                    </span>
                                  ))}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {prop.settlement ? (
                      <p className="aura-prop-board__settlement" data-outcome={prop.settlement.outcome}>
                        Result {prop.settlement.result}
                        {prop.unit === 'count' || prop.unit === '' ? '' : ` ${prop.unit}`} ·{' '}
                        {prop.settlement.outcome === 'push' || prop.settlement.outcome === 'void'
                          ? prop.settlement.outcome
                          : `${prop.settlement.outcome} hit`}
                        {prop.settlement.status === 'corrected' ? ' (corrected)' : ''}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}

      <footer>
        <span>{players.reduce((total, group) => total + group.props.length, 0)} props shown</span>
        <span>Linked players only · consensus prices</span>
      </footer>
    </section>
  );
}

function sideLabel(side: AuraPlayerPropModel['outcomes'][number]['side']): string {
  if (side === 'over') return 'Over';
  if (side === 'under') return 'Under';
  return side === 'yes' ? 'Yes' : 'No';
}

function settledSide(prop: AuraPlayerPropModel): string | null {
  const outcome = prop.settlement?.outcome;
  return outcome === 'over' || outcome === 'under' || outcome === 'yes' || outcome === 'no' ? outcome : null;
}
