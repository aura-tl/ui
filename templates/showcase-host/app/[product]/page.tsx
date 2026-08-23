import { notFound } from "next/navigation";
import { Product as Scores } from "../../components/scores";
import { Product as Sportsbook } from "../../components/sportsbook";
import { Product as Props } from "../../components/props";
import { Product as Arbitrage } from "../../components/arbitrage";
import { Product as Model } from "../../components/model";
import { Product as FantasyDraft } from "../../components/fantasy-draft";
import { Product as DfsLineup } from "../../components/dfs-lineup";
const apps: Record<string, () => React.ReactNode> = {
  scores: Scores,
  sportsbook: Sportsbook,
  props: Props,
  arbitrage: Arbitrage,
  model: Model,
  "fantasy-draft": FantasyDraft,
  "dfs-lineup": DfsLineup,
};
export function generateStaticParams() {
  return Object.keys(apps).map((product) => ({ product }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const App = apps[product];
  if (!App) notFound();
  return <App />;
}
