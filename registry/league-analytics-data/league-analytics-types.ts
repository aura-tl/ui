export type AuraAnalyticsAxisKey = 'x' | 'y';
export interface AuraAnalyticsAxis { definitionId:string; label:string; unit:{kind?:string;symbol?:string;scale?:number}|null; directionality:string; dimensions:Record<string,string|number|boolean>; }
export interface AuraAnalyticsPoint { id:string; name:string; team:string|null; position:string|null; x:number; y:number; size:number|null; color:number|null; successful:boolean|null; percentile:{x:number;y:number}; quadrant:string; cluster:string; frontier:boolean; }
export interface AuraLeagueLandscape {
  contractVersion:'2.0.0'; kind:'aura.research.league-landscape'; availability:{state:'available'|'unavailable';reason:string|null}; generatedAt:number; entityType:'team'|'player';
  axes:{x:AuraAnalyticsAxis;y:AuraAnalyticsAxis;size:AuraAnalyticsAxis|null;color:AuraAnalyticsAxis|null;outcome:AuraAnalyticsAxis|null};
  sample:{games:number;completeEntities:number;returnedEntities:number;aggregation:string;phases:string[]};
  domains:{x:[number,number];y:[number,number];size:[number,number]|null;color:[number,number]|null};
  quadrants:{method:string;xSplit:number;ySplit:number}; frontier:{method:string};
  targetBand:{available:boolean;method:string;outcome:null|{definitionId:string;operator:'gte'|'lte';threshold:number;label:string};successfulEntities:number;bounds:null|{xMin:number;xMax:number;yMin:number;yMax:number};coverage:number|null;precision:number|null;reason:string|null};
  points:AuraAnalyticsPoint[];
}
export const AURA_LEAGUE_LANDSCAPE_FIELDS = [
  'contractVersion', 'kind', 'availability', 'entityType', 'axes', 'sample', 'domains',
  'quadrants', 'frontier', 'targetBand', 'points.id', 'points.name', 'points.team',
  'points.position', 'points.x', 'points.y', 'points.size', 'points.color',
  'points.successful', 'points.percentile', 'points.quadrant', 'points.cluster', 'points.frontier',
] as const;
export interface AuraLeagueLandscapeQuery { entityType:'team'|'player'; x:string; y:string; size?:string; color?:string; outcome?:string; outcomeOperator?:'gte'|'lte'; outcomeThreshold?:number; outcomeLabel?:string; sport?:string; league?:string; phase?:string; cohort?:string; aggregate?:'latest'|'mean'|'sum'|'min'|'max'; from?:number; to?:number; limit?:number; xDimensions?:Record<string,string|number|boolean>; yDimensions?:Record<string,string|number|boolean>; sizeDimensions?:Record<string,string|number|boolean>; colorDimensions?:Record<string,string|number|boolean>; outcomeDimensions?:Record<string,string|number|boolean>; xDirection?:'higher'|'lower'; yDirection?:'higher'|'lower'; fields?: string | readonly string[]; }
export type AuraLeagueLandscapeState = {status:'loading'|'ready'|'unavailable'|'error';model:AuraLeagueLandscape|null;error:string|null};
export function toAuraLeagueLandscape(input:Record<string,unknown>):AuraLeagueLandscape { const value=input as unknown as AuraLeagueLandscape; if(value.contractVersion!=='2.0.0'||value.kind!=='aura.research.league-landscape'||!value.axes?.x||!value.axes?.y||!Array.isArray(value.points)) throw new Error('Invalid Aura League Landscape response'); return value; }
export function formatAuraAnalyticsValue(value:number,axis:AuraAnalyticsAxis){ if(axis.unit?.kind==='probability')return `${(value*100).toFixed(1)}%`; if(axis.unit?.kind==='percentage')return `${value.toFixed(value<1?1:0)}%`; if(Math.abs(value)<1)return value.toFixed(3); if(Math.abs(value)<10)return value.toFixed(1); return Math.round(value).toLocaleString(); }
