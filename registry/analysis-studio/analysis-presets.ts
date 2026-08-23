import type { AuraLeagueLandscapeQuery as LandscapeQuery } from "@/lib/aura/league-analytics-types";

export type AnalysisPreset = {
  id: string;
  label: string;
  question: string;
  cohortLabel: string;
  zones: {
    highHigh: string;
    lowHigh: string;
    highLow: string;
    lowLow: string;
  };
  query: LandscapeQuery;
};

const season = { window: "season_to_date" };

export const analysisPresets: AnalysisPreset[] = [
  {
    id: "power-reach",
    label: "Power & reach",
    cohortLabel: "2026 MLB hitters",
    question: "Who gets on base and still does damage?",
    zones: {
      highHigh: "Power + reach",
      lowHigh: "Power first",
      highLow: "Reach first",
      lowLow: "Below both",
    },
    query: {
      entityType: "player",
      sport: "MLB",
      x: "baseball.player.on_base_percentage",
      y: "baseball.player.slugging_percentage",
      xDimensions: season,
      yDimensions: season,
      aggregate: "latest",
      limit: 500,
    },
  },
  {
    id: "contact-damage",
    label: "Contact & damage",
    cohortLabel: "2026 MLB hitters",
    question: "Who pairs a strong hit tool with real power?",
    zones: {
      highHigh: "Power + contact",
      lowHigh: "Power first",
      highLow: "Contact first",
      lowLow: "Below both",
    },
    query: {
      entityType: "player",
      sport: "MLB",
      x: "baseball.player.batting_average",
      y: "baseball.player.slugging_percentage",
      xDimensions: season,
      yDimensions: season,
      aggregate: "latest",
      limit: 500,
    },
  },
  {
    id: "reach-contact",
    label: "Reach & contact",
    cohortLabel: "2026 MLB hitters",
    question: "Who reaches base without sacrificing consistent contact?",
    zones: {
      highHigh: "Reach + contact",
      lowHigh: "Contact first",
      highLow: "Reach first",
      lowLow: "Below both",
    },
    query: {
      entityType: "player",
      sport: "MLB",
      x: "baseball.player.on_base_percentage",
      y: "baseball.player.batting_average",
      xDimensions: season,
      yDimensions: season,
      aggregate: "latest",
      limit: 500,
    },
  },
];
